import { Injectable } from '@angular/core';

import { Subject } from 'rxjs';

import {
  User,
  RegisterUser,
  FirebaseAuthResponse
} from '@app/models';

import { FirebaseService } from '@app/services';

/**
 * Authentication related activities
 * INTERNAL
 * 
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user = new Subject<User>();

  constructor(
    private firebaseService: FirebaseService
  ) { }

  // register new user
  register(user: RegisterUser): Promise<FirebaseAuthResponse> {
    return this.firebaseService.register(user);
  }

  // login user
  async login(user: RegisterUser): Promise<FirebaseAuthResponse> {
    const response = await this.firebaseService.login(user);
    if (response.user) {
      this.user.next(new User('test-id', 'test-token', new Date()));
    }
    return response;
  }
}
