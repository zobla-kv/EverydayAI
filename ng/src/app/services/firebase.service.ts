import { Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup } from '@angular/forms';

import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { UserCredential } from '@angular/fire/auth';
import { User as FirebaseUser } from '@angular/fire/auth';
import { arrayRemove, arrayUnion, query, and, increment, collection, where, getDocs, Timestamp } from '@angular/fire/firestore';

import { firstValueFrom, Observable, of, delay, from, map, first, mergeMap } from 'rxjs';

import { Decimal } from 'decimal.js';

import {
  CustomUser,
  RegisterUser,
  FirebaseError,
  FirebaseConstants,
  EmailType,
  Labels,
  ProductResponse,
  ProductType,
  ProductTypePrint
} from '@app/models';

import {
  AuthService,
  HttpService,
  UtilService
} from '@app/services';

/**
 * Firebase related acitivies
 * EXTERNAL
 *
 */
@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  // TODO: in many methods below im passing user from outside, how about having user here

  constructor(
    private _fireAuth: AngularFireAuth,
    private _db: AngularFirestore,
    private _httpService: HttpService,
    private _utilService: UtilService,
    private _router: Router,
    private _injector: Injector
  ) { }

  // register new user
  // NOTE: same name allowed for multiple users
  register(user: RegisterUser): Promise<FirebaseError | void> {
    return this._fireAuth.createUserWithEmailAndPassword(user.email, user.password)
    .then(async (res: UserCredential | any) => {
      // firebase automatically logs in after register, prevent that
      const uid = res.user?.uid;

      // set displayName
      let profileUpdated = false;
      // TODO: if display name is stored in custom user, is this really needed?
      await res.user?.updateProfile({ displayName: user.name }).then(() => profileUpdated = true);

      /***** WRITE TO CUSTOM DB *****/
      const isWritten = await this.writeUserToDb({ ...user, id: uid });

      /***** SEND VERIFICATION EMAIL *****/
      const isSent = await this._httpService.sendEmail({ email: user.email, email_type: EmailType.ACTIVATION });
      if (!profileUpdated || !isWritten || !isSent) {
        // TODO: these 2 return promises, but how to handle?
        // delete firebase user
        res.user.delete();
        // delete custom user
        const usersCollection = this._db.collection('Users');
        usersCollection.doc(res.user.uid).delete();

        return Promise.resolve(new FirebaseError(FirebaseConstants.REGISTRATION_FAILED));
      }

      // registration successful
      return Promise.resolve();
    })
    // TODO: no handler for network failure, just form failures
    .catch(err => Promise.resolve(new FirebaseError(err.code)));
  }

  // log in user
  login(user: RegisterUser): Promise<FirebaseError | void> {
    return this._fireAuth.signInWithEmailAndPassword(user.email, user.password)
    .then(async (userData: any) => {
      if (!userData.user?.emailVerified) {
        // firebase automatically logs in user even without email verified, prevent that
        return Promise.resolve(new FirebaseError(FirebaseConstants.LOGIN_EMAIL_NOT_VERIFIED));
      }

      // login succeeded
      return Promise.resolve();
    })
    // resolve in catch leads to then
    .catch(err => Promise.resolve(new FirebaseError(err.code)));
  }

  // log out user
  async logout(): Promise<void> {
    this._fireAuth.signOut();
  }

  /**
  * For dealing with firebase default behaviour of loggin in user automatically
  * on register
  * on login with unverified email
  *
  * @param user - firebase user
  * @returns boolean - should be logged out?
  */
  reverseFirebaseAutoLogin(user: FirebaseUser): boolean {
    if (!user) {
      return false;
    }

    // check if user is logged by registration by checking if less than 10 seconds passed since registration
    const registrationTime = Date.parse(user.metadata.creationTime as string);
    const timeNow = Date.now();
    if ((timeNow - registrationTime) / 1000 < 10) {
      return true;
    }

    // check if user is logged in by login with unverified email
    if (!user.emailVerified) {
      return true;
    }

    return false;
  }

  // check if user exists and the send email
  sendPasswordResetEmail(email: string): Promise<FirebaseError | null> {
    return new Promise(async (resolve) => {
      // check if user exists
      const response = await this._fireAuth.fetchSignInMethodsForEmail(email);
      if (response.length === 0) {
        return resolve(new FirebaseError(FirebaseConstants.LOGIN_USER_NOT_FOUND));
      }
      // send email
      const isSent = await this._httpService.sendEmail({ email, email_type: EmailType.RESET_PASSWORD });
      if (!isSent) {
        return this._utilService.navigateToInformationComponent(Labels.PASSWORD_RESET_EMAIL_SENT_FAILED);
      }
      this._utilService.navigateToInformationComponent(Labels.PASSWORD_RESET_EMAIL_SENT_SUCCESS);
    })
  }

  // update password
  updatePassword(oobCode: string, password: string): void {
    // NOTE: password can be same as old one, not really an issue?
    this._fireAuth.confirmPasswordReset(oobCode, password)
    .then(() => {
      this._utilService.navigateToInformationComponent(Labels.PASSWORD_UPDATED_SUCCESS);
      setTimeout(() => this._router.navigate(['auth', 'login']), 2000);
    })
    .catch(() => this._utilService.navigateToInformationComponent(Labels.PASSWORD_UPDATED_FAILED))
  }

  // TODO: change RegisterUser -> User later
  getUserByEmail(email: string): Promise<RegisterUser> {
    return firstValueFrom(this._db.collection('Users', query => query.where('email', '==', email)).get())
    .then(res => {
      const user = res.docs[0]?.data() as RegisterUser;
      return Promise.resolve(user);
    });
  }

  // updates last active time on user
  async updateLastActiveTime(user: any): Promise<void> {
    this._db.collection('Users').doc(user.id).update({ lastActiveDate: new Date() });
  }

  // return value whether it succeeded
  private async writeUserToDb(user: RegisterUser): Promise<boolean> {
    // desctucture user and omit password
    const { password, ...customUser } = {
      ...user,
      role: 'basic',
      cart: { items: [], totalSum: '0.00' },
      registrationDate: new Date(),
      lastActiveDate: new Date(),
      stripe: { id: null },
      ownedItems: [],
      ownedItemsTimeMap: {},
      productLikes: []
    };

    let successfulWrite = true;
    await this._db.collection('Users').doc(user.id).set(customUser)
    .catch(err => {
      this._db.collection('FailedRegisterWrites').doc(user.email).set({ reason: err });
      successfulWrite = false;
    });
    return successfulWrite;
  }

  // from firebaseAuth get customUser
  async getUserByUid(uid: string): Promise<CustomUser> {
    return firstValueFrom(this._db.collection('Users').doc(uid).get())
    .then(user => user.data() as CustomUser);
  }

  // get all products
  getAllProducts(): Observable<ProductTypePrint[]> {
    return this._db.collection('Products/Prints/All').valueChanges() as Observable<ProductTypePrint[]>;
  }

  // get products by id
  getProductsById(ids: string[]): Observable<ProductTypePrint[]> {
    // if added because of user.cart can be empty array
    if (ids.length === 0) {
      return of([]);
    }
    return this._db.collection('Products/Prints/All', query => query.where('id', 'in', ids)).valueChanges() as Observable<ProductTypePrint[]>;
  }

  // add new product to db
  async addProduct(data: ProductResponse): Promise<string> {
    return this._db.collection('Products/Prints/All').add({
      ...data,
      creationDate: new Date()
    }).then(response => response.id)
  }

  // update product with missing fields after creation
  async updateProductAfterAdd(productId: string, fileName: string): Promise<void> {
    return this._db.collection('Products/Prints/All').doc(productId).ref.update({
      id: productId,
      fileName
    })
  }

  // update product
  async updateProduct(data: any): Promise<void> {
    return this._db.collection('Products/Prints/All').doc(data.id).ref.update({
      price: Number(data.price).toFixed(2),
      discount: Number(data.discount),
      likes: Number(data.likes),
      'metadata.tier': data.tier,
      isActive: data.isActive
    })
  }

  // delete product from db
  // TODO: dont remove during cleanup
  removeProduct(productId: string): Promise<void> {
    return this._db.collection('Products/Prints/All').doc(productId).delete();
  }

  // get products for type print tab shop
  getProductsForTypePrintTabShop(user: CustomUser | null): Observable<ProductResponse[] | []> {
    // logged out or logged in with no owned items
    if (!user || user.ownedItems.length === 0) {
      return this._db.collection('Products/Prints/All', query => query.where('isActive', '==', true)).valueChanges() as Observable<ProductTypePrint[]>;
    }
    // compound query like this doens't work. The working one even requires index to be created in firebase
    // return this._db.collection('Products/Prints/All', query =>
    // query.where('id', 'not-in', user.ownedItems).where('isActive', '==', true)).valueChanges() as Observable<ProductTypePrint[]>;
    const q = query(collection(this._db.firestore, 'Products/Prints/All'),
      and(
        where('id', 'not-in', user.ownedItems),
        where('isActive', '==', true)
      )
    );
    return from(getDocs(q).then(querySnapshot => querySnapshot.docs.map(doc => doc.data() as ProductResponse)));
  }

  // get products for type print tab owned items
  getProductsForTypePrintTabOwnedItems(user: CustomUser | null): Observable<ProductResponse[] | []> {
    if (!user || user.ownedItems.length === 0) {
      return of([]).pipe(delay(500))
    }
    return this._db.collection('Products/Prints/All', query => query.where('id', 'in', user.ownedItems)).valueChanges() as Observable<ProductResponse[]>;
  }

  // add single product to cart
  addProductToCart(productId: string): Promise<void> {
    // .getUser sync version because this can only be triggered if user is logged in
    const currentUserId = this._injector.get<AuthService>(AuthService).getUser()?.id;
    return this._db.collection('Users').doc(currentUserId).ref.update({
      'cart': arrayUnion(productId)
    })
  }

  // remove single product from cart
  removeProductFromCart(productId: string): Promise<void> {
    // NOTE: below line will require change if getUser is to become async
    const currentUserId = this._injector.get<AuthService>(AuthService).getUser()?.id;
    return this._db.collection('Users').doc(currentUserId).ref.update({
      'cart': arrayRemove(productId)
    })
  }

  // add product like to user and product
  async addProductLike(productId: string, user: CustomUser | null) {
    this._db.collection('Products/Prints/All', query => query.where('id', '==', productId)).get()
      .subscribe(res => {
        const productDoc = res.docs[0];
        let likes = (res.docs[0].data() as ProductResponse).likes;
        productDoc.ref.update({ likes: ++likes });
      });

    if (user) {
      this._db.collection('Users').doc(user.id).ref.update({
        'productLikes': arrayUnion(productId),
      })
    }
  }

  // add item to user
  addProductToUser(productId: string, user: CustomUser): Observable<any> {
    return this._db.collection('Users').doc(user.id).get().pipe(
      first(),
      // mergeMap -> wait for promise inside observable
      mergeMap(async res => {
        const ownedItemsTimeMap = (res.data() as CustomUser).ownedItemsTimeMap;
        ownedItemsTimeMap[productId] = Timestamp.fromDate(new Date());
        const filteredCart = user.cart.filter(id => id !== productId);
        return this._db.collection('Users').doc(user.id).update({
          'cart': filteredCart,
          'ownedItems': arrayUnion(productId),
          'ownedItemsTimeMap': ownedItemsTimeMap
        });
      })
    );
  }
}
