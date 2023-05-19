import { Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';

import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { arrayRemove, arrayUnion, deleteDoc, doc, increment } from '@angular/fire/firestore';

// transform subscription into promise
import { firstValueFrom, Observable } from 'rxjs';

import {
  CustomUser,
  RegisterUser,
  FirebaseAuthResponse,
  FirebaseConstants,
  EmailType,
  Product
} from '@app/models';

import {
  AuthService,
  HttpService, 
  UtilService
} from '@app/services';
import { UserCredential } from '@angular/fire/auth';


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
  // TODO: duplicate name allowed?
  register(user: RegisterUser): Promise<FirebaseAuthResponse> {
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
      // get user data to return to auth service (then can be used for passing email to information component)
      // TODO: this step might not be needed (speed up if deleted)
      const tempUser: RegisterUser = await this.getUserByEmail(user.email);
      if (!profileUpdated || !isWritten || !tempUser || !isSent) {
        // TODO: these 2 return promises, but how to handle?
        
        // delete firebase user
        res.user.delete();
        // delete custom user
        const usersCollection = this._db.collection('Users');
        usersCollection.doc(res.user.uid).delete();

        return Promise.resolve(new FirebaseAuthResponse(null, FirebaseConstants.REGISTRATION_FAILED));
        //TODO: delete user written by first createUserWithEmailAndPassword !!
      }

      // registration successful
      return Promise.resolve(new FirebaseAuthResponse(tempUser, null));
    })
    .catch(err => Promise.resolve(new FirebaseAuthResponse(null, FirebaseAuthResponse.formatError(err.code))));
  }

  // log in user
  login(user: RegisterUser): Promise<FirebaseAuthResponse> {
    return new Promise(async (resolve) => {
      // loginResponse.user can be used for many things (emailVerified etc.)
      // TODO: maybe delete, why use signInWithEmailAndPassword if i can directly talk to db
      const loggedUserData = await this._fireAuth.signInWithEmailAndPassword(user.email, user.password)
      .catch(err => { resolve(new FirebaseAuthResponse(null, FirebaseConstants.LOGIN_WRONG_CREDENTIALS)) });
      
      if (!loggedUserData) {
        // this if means signIn went into catch block
        // does not stop execution so stop it manually
        return;
      }

      if (!loggedUserData.user?.emailVerified) {
        // firebase automatically logs in user even without email verified, prevent that
        // this.logout();
        return resolve(new FirebaseAuthResponse(null, FirebaseConstants.LOGIN_EMAIL_NOT_VERIFIED));
      }

      // doesn't matter if it succeeded
      this.updateLastActiveTime(loggedUserData.user)

      resolve(new FirebaseAuthResponse(loggedUserData.user, null));
    })
  }

  // log out user
  logout(): void {
    this._fireAuth.signOut();
  }

  // check if user exists and the send email
  sendPasswordResetEmail(email: string): Promise<FirebaseAuthResponse | null> {
    return new Promise(async (resolve) => {
      // check if user exists
      const response = await this._fireAuth.fetchSignInMethodsForEmail(email);
      if (response.length === 0) {
        return resolve(new FirebaseAuthResponse(null, FirebaseConstants.USER_NOT_FOUND))
      }
      // send email
      const isSent = await this._httpService.sendEmail({ email, email_type: EmailType.RESET_PASSWORD });
      if (!isSent) {
        return this._utilService.navigateToInformationComponent('Failed to send email containing password reset link. Please try again.');
      }
      this._utilService.navigateToInformationComponent('Email containing password reset link has been sent to your email address.');
    })
  }

  // update password
  updatePassword(oobCode: string, password: string): void {
    // TODO: password can be same as old one, not really an issue?
    this._fireAuth.confirmPasswordReset(oobCode, password)
    .then(() => {
      this._utilService.navigateToInformationComponent('Password updated succesfully. Redirecting to login page...');
      setTimeout(() => this._router.navigate(['auth', 'login']), 2000);
    })
    .catch(() => this._utilService.navigateToInformationComponent('Failed to update password. Please try again.'))
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
  async updateLastActiveTime(user: any): Promise<void> {;
    this._db.collection('Users').doc(user.uid).update({ lastActiveDate: new Date() });
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
    .then(user => Promise.resolve(user.data() as CustomUser));
  }
  
  // return all products from db wrapped by observable
  getProducts(): Observable<Product[]> {
    // valueChanges makes it an observable
    return this._db.collection('Products').valueChanges() as Observable<Product[]>;
  }

  // add single product to cart
  addProductToCart(product: Product): Promise<void> {
  // .getUser sync version because this can only be triggered if user is logged in
  const currentUserId = this._injector.get<AuthService>(AuthService).getUser()?.id;
  return this._db.collection('Users').doc(currentUserId).ref.update({
    'cart.items': arrayUnion(product),
    'cart.totalSum': increment(
        product.information.discount ? 
          product.information.discount.discountedPrice : 
          product.information.price
      )
    })
  }

  // remove single product from cart
  removeProductFromCart(product: Product): Promise<void> {
    // TODO: below line will require change if getUser is to become async
    const currentUserId = this._injector.get<AuthService>(AuthService).getUser()?.id;
    return this._db.collection('Users').doc(currentUserId).ref.update({
      'cart.items': arrayRemove(product),
      'cart.totalSum': increment(
          product.information.discount ? 
            -product.information.discount.discountedPrice : 
            -product.information.price
        )
      })
    }

}
