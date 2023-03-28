import { Injectable } from '@angular/core';
import { User } from '@angular/fire/auth';
import { Router } from '@angular/router';

import {
  AppConstants,
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
    this.setUserToSessionStorage();
    this._user = await this._firebaseService.getUserByUid(user.uid);
  }

  // get custom user
  // TODO: should this be async? (get user on start then update cart on BE? then they out of sync)
  getUser(): CustomUser | null {
    return this._user;
  }

  // remove custom user
  removeUser(): void {
    this.removeUserFromSessionStorage();
    this._user = null;
  }

  // save mock user to session storage (should exist only if user is logged in)
  setUserToSessionStorage(): void {
    if (!sessionStorage.getItem(AppConstants.STORAGE_USER_KEY)) {
      sessionStorage.setItem(AppConstants.STORAGE_USER_KEY, AppConstants.STORAGE_USER_VALUE)
    }
  }
  
  // for immediately returning user logged in state (avoid flickering)
  getUserFromSessionStorage(): string | null {
    return sessionStorage.getItem(AppConstants.STORAGE_USER_KEY);
  }

  // remove mock user from session storage
  removeUserFromSessionStorage(): void {
    if (sessionStorage.getItem(AppConstants.STORAGE_USER_KEY)) {
      sessionStorage.removeItem(AppConstants.STORAGE_USER_KEY)
    }
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

}
