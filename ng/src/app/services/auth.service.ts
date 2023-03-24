import { Injectable } from '@angular/core';
import { User } from '@angular/fire/auth';
import { Router } from '@angular/router';

import {
  CustomUser,
  RegisterUser,
  FirebaseAuthResponse,
  FirebaseConstants
} from '@app/models';

import {
  FirebaseService,
  UtilService
 } from '@app/services';

/**
 * Authentication related activities
 * INTERNAL
 *
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // NOTE: FirebaseService contains default user
  // Custom user is stored in db
  private _user: CustomUser | null; 

  constructor(
    private _firebaseService: FirebaseService,
    private _utilService: UtilService,
    private _router: Router
  ) { }

  // set custom user (transfer from firebase user to custom user)
  async setUser(user: User): Promise<void> {
    // TODO: what happens if db call fails
    // two users would be out of sync (fb user is there but custom isn't)
    // some error handling needed?
    console.log('set fired');
    this._user = await this._firebaseService.getUserByUid(user.uid);
    console.log('set done: ', this._user);
  }

  // get custom user
  getUser(): CustomUser | null {
    return this._user;
  }

  // remove custom user
  removeUser(): void {
    this._user = null;
  }

  // register new user
  async register(user: RegisterUser): Promise<FirebaseAuthResponse | void> {
    const response = await this._firebaseService.register(user);
    if (response.error) {
      return response;
    }
    this._utilService.navigateToInformationComponent(FirebaseAuthResponse.getMessage(FirebaseConstants.REGISTRATION_SUCCESSFUL));
  }

  // login user
  async login(user: RegisterUser): Promise<FirebaseAuthResponse | void> {
    const response = await this._firebaseService.login(user);
    if (response.error) {
      return response;
    }
    this._router.navigate(['/']);
  }

  // logout user
  async logout(): Promise<FirebaseAuthResponse | void> {
    this._firebaseService.logout();
    this._router.navigate(['/']);
  }

  // sets mock value representing user
// -  setUser(): void {
//   -    if (!sessionStorage.getItem(AppConstants.STORAGE_USER_KEY)) {
//   -      sessionStorage.setItem(AppConstants.STORAGE_USER_KEY, AppConstants.STORAGE_USER_VALUE)
//   -    }
//   -  }
//   -
//   -  // get mock value from session storage
//   -  getUser(): string | null {
//   -    return sessionStorage.getItem(AppConstants.STORAGE_USER_KEY);
//   -  }
//   -
//   -  // remove mock user from session storage
//   -  removeUser(): void {
//   -    if (sessionStorage.getItem(AppConstants.STORAGE_USER_KEY)) {
//   -      console.log('remove session')
//   -      sessionStorage.removeItem(AppConstants.STORAGE_USER_KEY)
//   -    }
//   -  }

}
