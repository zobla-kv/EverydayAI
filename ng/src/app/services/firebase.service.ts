import { Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';

import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, DocumentChangeAction } from '@angular/fire/compat/firestore';
import { UserCredential } from '@angular/fire/auth';
import { User as FirebaseUser } from '@angular/fire/auth';
import { arrayRemove, arrayUnion, query, and, collection, where, getDocs, Timestamp, DocumentData, OrderByDirection, QuerySnapshot } from '@angular/fire/firestore';
import { CollectionReference, Query } from '@angular/fire/compat/firestore';

import { firstValueFrom, Observable, of, delay, from, first, mergeMap, Subject, map } from 'rxjs';


import {
  CustomUser,
  RegisterUser,
  FirebaseError,
  FirebaseConstants,
  EmailType,
  Labels,
  ProductResponse,
  ProductTypePrint,
  ProductFilters,
  ProductUploadResponse
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

  // store last query and item used for pagination
  // make sure to reset when destroying component
  // NOTE: not to be used from multiple places
  lastQuery: Query<DocumentData> | null;
  lastLoadedWithPagination: any;
  // is product list currently fetching
  isProductListFetching$ = new Subject<boolean>();
  // search submitted
  search$ = new Subject<string>();

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
      // TODO: move to BE and enable email enumeration protection
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
      cart: [],
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
    return this._db.collection('Products').valueChanges() as Observable<ProductTypePrint[]>;
  }

  // get products by id
  getProductsById(ids: string[]): Observable<ProductResponse[]> {
    // return throwError('no way') TODO: remove this
    // if added because of user.cart can be empty array
    if (ids.length === 0) {
      return of([]);
    }
    return this._db.collection('Products', query => query.where('id', 'in', ids))
    .get()
    .pipe(
      map(querySnapshot => querySnapshot.docs.map(doc => doc.data() as ProductResponse))
    );
    // .valueChanges() caches and not always returns all results
    // return this._db.collection('Products', query => query.where('id', 'in', ids)).valueChanges() as Observable<ProductResponse[]>;
  }

  // get products sorted by most likes
  getProductsByMostLikes(limit?: number): Observable<ProductResponse[]> {
    if (limit === 0) {
      return of([]);
    }
    if (!limit) {
      return this._db.collection('Products', query => query.where('isActive', '==', true).orderBy('likes', 'desc')).valueChanges() as Observable<ProductResponse[]>;
    }
    return this._db.collection('Products', query => query.where('isActive', '==', true).limit(limit).orderBy('likes', 'desc')).valueChanges() as Observable<ProductResponse[]>;
  }

  // add new product to db
  async addProduct(data: ProductResponse): Promise<string> {
    return this._db.collection('Products').add({
      ...data,
      creationDate: new Date()
    })
    .then(response => response.id);
  }

  // update product with missing fields after creation
  async updateProductAfterAdd(productId: string, imgPaths: ProductUploadResponse): Promise<void> {
    return this._db.collection('Products').doc(productId).ref.update({
      id: productId,
      watermarkImgPath: imgPaths.watermarkImgPath,
      originalImgPath: imgPaths.originalImgPath
    });
  }

  // update product
  async updateProduct(data: any): Promise<void> {
    return this._db.collection('Products').doc(data.id).ref.update({
      price: Number(Number(data.price).toFixed(2)),
      discount: Number(data.discount),
      likes: Number(data.likes),
      'metadata.tier': data.tier,
      'metadata.color': data.color,
      isActive: data.isActive,
      isFree: (Number(data.price) === 0 || Number(data.discount) === 100) ? true : false,
      isDiscounted: Number(data.discount) > 0 ? true : false
    })
  }

  // delete product from db
  // NOTE: dont remove during cleanup
  removeProduct(productId: string): Promise<void> {
    return this._db.collection('Products').doc(productId).delete();
  }


  // construct filter query
  // private async  _constructFilterQuery(col: CollectionReference<any>, filters: ProductFilters): Query<DocumentData> | Promise<Query<DocumentData>> {
  private async  _constructFilterQuery(col: CollectionReference<any>, filters: ProductFilters): Promise<Query<DocumentData>> {
    let compoundQuery: Query<DocumentData> = col;

    const searchFilter = filters['search'];
    const orientationFilter = filters['orientation'];
    const priceFilter = filters['price'];
    const colorFilter = filters['color'];

    compoundQuery = compoundQuery.where('isActive', '==', true);

    // TODO: move all to elastic and then do error handling for all (error field in filters?)
    // TODO: move validation to BE when this is implemented
    // search filter
    if (searchFilter.value) {
      const productIds = await this._httpService.getProductsBySearchText(searchFilter.value)
      // if nothing found return immediately
      if (productIds.length === 0) {
        return compoundQuery.where('id', '==', null);
      }
      compoundQuery = compoundQuery.where('id', 'in', productIds);
    }

    // orientation filter
    if (orientationFilter && orientationFilter.value !== orientationFilter.default) {
      compoundQuery = compoundQuery.where('metadata.orientation', '==', orientationFilter.value);
    }

    // price filter
    if (priceFilter && priceFilter.value !== priceFilter.default) {
      if (priceFilter.value === 'free') {
        compoundQuery = compoundQuery.where('isFree', '==', true);
      } else if (priceFilter.value === 'on sale') {
        compoundQuery = compoundQuery.where('isDiscounted', '==', true);
      }
    }

    // color filter
    if (colorFilter && colorFilter.value !== colorFilter.default) {
      compoundQuery = compoundQuery.where('metadata.color', '==', colorFilter.value);
    }

    return this._constructSortQuery(compoundQuery, filters);
  }

  // construct sort query
  private _constructSortQuery(compoundQuery: Query<DocumentData>, filters: ProductFilters): Query<DocumentData> {
    const sortFilter = filters['sort'];
    const defaultSort = compoundQuery.orderBy('creationDate', 'desc')

    // no sort - default latest
    if (!sortFilter || sortFilter.value === sortFilter.default) {
      return defaultSort;
    }

    // price sort
    if (sortFilter.value.includes('price')) {
      const direction = sortFilter.value.split(' ')[1] as OrderByDirection;
      return compoundQuery.orderBy('price', direction);
    }

    // popularity sort
    if (sortFilter.value.includes('popular')) {
      return compoundQuery.orderBy('likes', 'desc');
    }

    return defaultSort;
  }

  // reset flags that affect pagination
  resetPagination() {
    this.lastQuery = null;
    this.lastLoadedWithPagination = null;
  }

  // get paginated products
  getProductsPaginated(filters: ProductFilters, limit: number): Observable<ProductResponse[] | []> {
    const handle = (snapshot: any, query: any) => {
      this.lastQuery = query;
      this.lastLoadedWithPagination = snapshot.docs[snapshot.docs.length - 1];
      return snapshot.docs.map((doc: any) => doc.data()) as ProductResponse[];
    }

    if (this.lastQuery && this.lastLoadedWithPagination) {
      return from(this.lastQuery.startAfter(this.lastLoadedWithPagination).limit(limit).get().then(snapshot => handle(snapshot, this.lastQuery)));
    } else {
      const collectionRef = this._db.collection('Products').ref;
      return from(this._constructFilterQuery(collectionRef, filters)
      .then(query => query.limit(limit).get().then(snapshot => handle(snapshot, query))))
    }
  }

  // get products for type print tab shop
  getProductsForTypePrintTabShop(user: CustomUser | null): Observable<ProductResponse[] | []> {
    // logged out or logged in with no owned items
    if (!user || user.ownedItems.length === 0) {
      return this._db.collection('Products', query => query.where('isActive', '==', true)).valueChanges() as Observable<ProductTypePrint[]>;
    }
    // compound query like this doens't work. The working one even requires index to be created in firebase
    // return this._db.collection('Products', query =>
    // query.where('id', 'not-in', user.ownedItems).where('isActive', '==', true)).valueChanges() as Observable<ProductTypePrint[]>;
    const q = query(collection(this._db.firestore, 'Products'),
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
    return this._db.collection('Products', query => query.where('id', 'in', user.ownedItems)).valueChanges() as Observable<ProductResponse[]>;
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
    this._db.collection('Products', query => query.where('id', '==', productId)).get()
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
