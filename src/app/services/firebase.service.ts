import { Injectable } from '@angular/core';

import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';

import { 
  RegisterUser, 
  FirebaseResponse 
} from '@app/models';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  constructor(
    private fireAuth: AngularFireAuth,
    private fireStore: AngularFirestore
  ) { }

  // register new user
  register(user: RegisterUser): Promise<FirebaseResponse> {
    return this.fireAuth.createUserWithEmailAndPassword(user.email, user.password)
    .then(res => {
      // res has intereseting data, check it out (email for example)
      user.id = this.fireStore.createId();
      this.fireStore.collection('Users').doc(user.id).set(user);
      return Promise.resolve({ error: null, errorMessage: null });
    })
    .catch(err => Promise.resolve({ 
      error: this.formatError(err.code),
      errorMessage: this.formatErrorMessage(err.message)
    }))
  }

  // formats error returned by firebase
  formatError(error: string): string {
    // before -> auth/email-already-in-use
    // after  -> email-already-in-use
    return error.split('/')[1];
  }

  // formats error message returned by firebase
  formatErrorMessage(message: string): string {
    // before -> Firebase: The email address is already in use by another account. (auth/email-already-in-use)
    // after  -> The email address is already in use by another account
    return message.split(':')[1].split('.')[0].trim();
  }


}
