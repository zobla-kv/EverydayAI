import { Injectable } from '@angular/core';

import { Subject } from 'rxjs';

import {
  User,
  RegisterUser,
  FirebaseResponse
} from '@app/models';

import { FirebaseService } from '@app/services';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user = new Subject<User>();

  constructor(
    private FirebaseService: FirebaseService
  ) { }

  // register new user
  register(user: RegisterUser): Promise<FirebaseResponse> {
    return this.FirebaseService.register(user);
  }

  // login user
  login() {
    const user = new User('test-id', 'test-token', new Date());
    this.user.next(user);
  }
}
