import { Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';

import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { UserCredential } from '@angular/fire/auth';
import { arrayRemove, arrayUnion, deleteDoc, doc, increment } from '@angular/fire/firestore';

// transform subscription into promise
import { firstValueFrom, Observable } from 'rxjs';

import {
  CustomUser,
  RegisterUser,
  FirebaseError,
  FirebaseConstants,
  EmailType,
  Labels,
  ProductResponse
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
    let successfulWrite = true;
    // TODO: izbaci sifru odavde (sacuvaj negde drugde)
    const customUser: CustomUser = { 
      ...user, 
      cart: { items: [], totalSum: 0},
      registrationDate: new Date(), 
      lastActiveDate: new Date()
    }; 
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
  
  // return all products from db wrapped by observable
  getProducts(): Observable<ProductResponse[]> {
    // valueChanges makes it an observable
    return this._db.collection('Products').valueChanges() as Observable<ProductResponse[]>;
  }

  // add single product to cart
  addProductToCart(product: ProductResponse): Promise<void> {
  // .getUser sync version because this can only be triggered if user is logged in
  const currentUserId = this._injector.get<AuthService>(AuthService).getUser()?.id;
  return this._db.collection('Users').doc(currentUserId).ref.update({
    'cart.items': arrayUnion(product),
    'cart.totalSum': increment(product.discount > 0 ? (product.price * product.discount / 100) : product.price)
    })
  }

  // remove single product from cart
  removeProductFromCart(product: ProductResponse): Promise<void> {
    // NOTE: below line will require change if getUser is to become async
    const currentUserId = this._injector.get<AuthService>(AuthService).getUser()?.id;
    return this._db.collection('Users').doc(currentUserId).ref.update({
      'cart.items': arrayRemove(product),
      'cart.totalSum': increment(product.discount > 0 ? -(product.price * product.discount / 100) : -product.price)
      })
    }

}
