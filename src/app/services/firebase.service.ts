import { Injectable } from '@angular/core';

import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';

// transform subscription into promise
import { firstValueFrom } from 'rxjs';

import {
  User,
  RegisterUser,
  FirebaseAuthResponse,
} from '@app/models';

const DB_OPERATION_SUCCESS = 'success';
const DB_OPERATION_FAIL = 'fail';

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
    private _db: AngularFirestore
  ) { }

  // register new user
  register(user: RegisterUser): Promise<FirebaseAuthResponse> {
    return this._fireAuth.createUserWithEmailAndPassword(user.email, user.password)
    .then(async res => {
      // res has intereseting data, check it out (email for example)
      const isWritten = await this.writeUserToDb(user);
      const tempUser = await this.getUserByEmail(user.email);
      if (!isWritten || !tempUser) {
        return Promise.resolve(this.generateResponse(null, 'registration-write-failed'));
        // delete user written by first createUserWithEmailAndPassword
      }

      const isSent = await this.sendVerificationEmail();
      if (!isSent) {
        return Promise.resolve(this.generateResponse(null, 'verification-email-sending-failed'));
        // delete user written by first createUserWithEmailAndPassword
      }
      // registration successful
      return Promise.resolve(this.generateResponse(tempUser, null));
    })
    .catch(err => Promise.resolve(this.generateResponse(null, err.code)));
  }

  // log in user
  login(user: RegisterUser): Promise<FirebaseAuthResponse> {
    return new Promise(async (resolve) => {
      // loginResponse.user can be used for many things (emailVerified etc.)
      // TODO: maybe delete, why use signInWithEmailAndPassword if i can directly talk to db
      const loginResponse = await this._fireAuth.signInWithEmailAndPassword(user.email, user.password)
      .catch(err => resolve(this.generateResponse(null, err.code)));

      const tempUser = await this.getUserByEmail(user.email);
      resolve(this.generateResponse(tempUser, null));
    })
  }


  // generate auth response
  generateResponse(user: RegisterUser | null, error: string | null): FirebaseAuthResponse {
    return new FirebaseAuthResponse(user, error);
  }

  // sends email for verification
  async sendVerificationEmail(): Promise<boolean> {
    let isSent = true;
    await this._fireAuth.currentUser.then(user => user?.sendEmailVerification().catch(err => isSent = false))
    return isSent;
  }

  // TODO: change RegisterUser -> User later
  getUserByEmail(email: string): Promise<RegisterUser> {
    return firstValueFrom(this._db.collection('Users', query => query.where('email', '==', email)).get())
    .then(res => {
      const user = res.docs[0].data() as RegisterUser;
      return Promise.resolve(user);
    });
  }

  // return value whether it succeeded
  private async writeUserToDb(user: RegisterUser): Promise<boolean> {
    let successfulWrite = true;
    user.id = this._db.createId();
    await this._db.collection('Users').doc(user.id).set(user)
    .catch(err => {
      this._db.collection('FailedRegisterWrites').doc(user.email).set({ reason: err });
      successfulWrite = false;
    });
    return successfulWrite;
  }

}
