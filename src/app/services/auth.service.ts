import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';

import {
  User
} from '@app/models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private router: Router,
    private fireAuth: AngularFireAuth,
    private fireStore: AngularFirestore
  ) { }

  // register new user
  register(user: User): Promise<string> {
    return this.fireAuth.createUserWithEmailAndPassword(user.email, user.password)
    .then(res => {
      user.id = this.fireStore.createId();
      return this.fireStore.collection('Users').doc(user.id).set(user);
    })
    .then(() => this.router.navigate(['/']))
    .catch(err => err)
  }
}
