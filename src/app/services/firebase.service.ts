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
    private fireAuth: AngularFireAuth,
    private db: AngularFirestore
  ) { }

  // register new user
  register(user: RegisterUser): Promise<FirebaseAuthResponse> {
    return this.fireAuth.createUserWithEmailAndPassword(user.email, user.password)
    .then(async res => {
      // res has intereseting data, check it out (email for example)
      user.id = this.db.createId();
      await this.db.collection('Users').doc(user.id).set(user)
      .catch(err => this.db.collection('FailedRegisterWrites').doc(user.email).set({ reason: err }));
      // TODO: delete user written by first call if catch is reached

      const tempUser = await this.getUserByEmail(user.email);

      return Promise.resolve(this.generateResponse(tempUser, null));
    })
    .catch(err => Promise.resolve(this.generateResponse(null, err.code)));
  }

  // log in user
  login(user: RegisterUser): Promise<FirebaseAuthResponse> {
    return new Promise(async (resolve) => {
      // loginResponse.user can be used for many things (emailVerified etc.)
      // TODO: maybe delete, why use signInWithEmailAndPassword if i can directly talk to db
      const loginResponse = await this.fireAuth.signInWithEmailAndPassword(user.email, user.password)
      .catch(err => resolve(this.generateResponse(null, err.code)));

      const tempUser = await this.getUserByEmail(user.email);
      resolve(this.generateResponse(tempUser, null));
    })
  }

  // generate auth response
  generateResponse(user: RegisterUser | null, error: string | null): FirebaseAuthResponse {
    return new FirebaseAuthResponse(user, error);
  }

  // TODO: change RegisterUser -> User later
  getUserByEmail(email: string): Promise<RegisterUser> {
    return firstValueFrom(this.db.collection('Users', query => query.where('email', '==', email)).get())
    .then(res => {
      const user = res.docs[0].data() as RegisterUser;
      return Promise.resolve(user);
    })
  }

}
