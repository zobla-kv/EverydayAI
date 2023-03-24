import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';

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
  HttpService, 
  UtilService
} from '@app/services';
import { UserCredential } from '@angular/fire/auth';
import { DocumentSnapshot } from '@angular/fire/firestore';


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
    private _router: Router
  ) { }

  // register new user
  // TODO: duplicate name allowed?
  // TODO: login form no password eye (not related to this place)
  register(user: RegisterUser): Promise<FirebaseAuthResponse> {
    return this._fireAuth.createUserWithEmailAndPassword(user.email, user.password)
    .then(async (res: UserCredential | any) => {
      // firebase automatically logs in after register, prevent that
      // get uid before that 
      const uid = res.user?.uid;
      this.logout();

      // set displayName
      let profileUpdated = false;
      // TODO: if display name is stored in custom user, is this really needed?
      await res.user?.updateProfile({ displayName: user.name }).then(() => profileUpdated = true);

      /***** WRITE TO CUSTOM DB *****/
      const isWritten = await this.writeUserToDb({...user, id: uid });
      // TODO: this step might not be needed (speed up if deleted)
      const tempUser = await this.getUserByEmail(user.email);
      if (!profileUpdated || !isWritten || !tempUser) {
        return Promise.resolve(new FirebaseAuthResponse(null, FirebaseConstants.REGISTRATION_WRITE_FAILED));
        // delete user written by first createUserWithEmailAndPassword
      }
      /******************************/

      /***** SEND VERIFICATION EMAIL *****/
      const isSent = await this._httpService.sendEmail(
        { email: user.email, email_type: EmailType.ACTIVATION }
      );
      if (!isSent) {
        return Promise.resolve(new FirebaseAuthResponse(null, FirebaseConstants.REGISTRATION_VERIFICATION_EMAIL_FAILED));
        // registration goes through but it fails to send verification link
        // delete user written by first createUserWithEmailAndPassword
      }
      /***********************************/

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
        this.logout();
        return resolve(new FirebaseAuthResponse(null, FirebaseConstants.LOGIN_EMAIL_NOT_VERIFIED));
      }

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
        // TODO: no resend option
        // also for registration
        return this._utilService.navigateToInformationComponent('Failed to send email verification link. Please try again.');
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

  // return value whether it succeeded
  private async writeUserToDb(user: RegisterUser): Promise<boolean> {
    let successfulWrite = true;
    // TODO: izbaci sifru odavde (sacuvaj negde drugde)
    const customUser: CustomUser = { ...user, cart: { items: [], totalSum: 0 } }; 
    await this._db.collection('Users').doc(user.id).set(customUser)
    .catch(err => {
      this._db.collection('FailedRegisterWrites').doc(user.email).set({ reason: err });
      successfulWrite = false;
    });
    return successfulWrite;
  }

  // return all products from db wrapped by observable
  getProducts(): Observable<Product[]> {
    // valueChanges makes it an observable
    return this._db.collection('Products').valueChanges() as Observable<Product[]>;
  }

  // from firebaseAuth get customUser
  async getUserByUid(uid: string): Promise<CustomUser> {
    return firstValueFrom(this._db.collection('Users').doc(uid).get())
    .then(user => Promise.resolve(user.data() as CustomUser));
  }

}
