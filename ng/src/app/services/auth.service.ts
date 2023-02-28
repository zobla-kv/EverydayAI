import { Injectable } from '@angular/core';

import {
  AppConstants,
  RegisterUser,
  FirebaseAuthResponse,
  FirebaseConstants
} from '@app/models';

import {
  FirebaseService,
  UtilService
 } from '@app/services';
import { Router } from '@angular/router';

/**
 * Authentication related activities
 * INTERNAL
 *
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private _firebaseService: FirebaseService,
    private _utilService: UtilService,
    private _router: Router
  ) { }

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
  }

  // sets mock value representing user
  setUser(): void {
    if (!sessionStorage.getItem(AppConstants.STORAGE_USER_KEY)) {
      sessionStorage.setItem(AppConstants.STORAGE_USER_KEY, AppConstants.STORAGE_USER_VALUE)
    }
  }

  // get mock value from session storage
  getUser(): string | null {
    return sessionStorage.getItem(AppConstants.STORAGE_USER_KEY);
  }

  // remove mock user from session storage
  removeUser(): void {
    if (sessionStorage.getItem(AppConstants.STORAGE_USER_KEY)) {
      console.log('remove session')
      sessionStorage.removeItem(AppConstants.STORAGE_USER_KEY)
    }
  }

}
