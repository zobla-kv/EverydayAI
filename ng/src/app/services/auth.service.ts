import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ReplaySubject, Subject } from 'rxjs';

import { User } from '@angular/fire/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth';

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
  private _user: CustomUser | null = null;

  // subscribe to user state changes (update of cart etc.)
  public userState$ = new ReplaySubject<CustomUser | null>();

  constructor(
    private _fireAuth: AngularFireAuth,
    private _firebaseService: FirebaseService,
    private _utilService: UtilService,
    private _router: Router
  ) {
    // auth coming from firebase
    this._fireAuth.onAuthStateChanged(async user => {
      // to counter firebase default auto login behaviour
      if (this._utilService.reverseFirebaseAutoLogin(user as User)) {
        this.logout(false);
        return;
      }
      user ? this.setUser(<User>user) : this.setUser(null);
    });
  }

  // set custom user (transfer from firebase user to custom user)
  async setUser(user: User | null): Promise<void> {
    // TODO: what happens if db call fails
    // two users would be out of sync (fb user is there but custom isn't)
    // some error handling needed?
    if (user) {
      this._user = await this._firebaseService.getUserByUid(user.uid);
    } else {
      this._user = null;
    }
    this.userState$.next(this._user);
  }

  // get custom user - sync 
  // use if not on load
  getUser(): CustomUser | null {
    return this._user;
  }

  // update user object to be in sync with DB
  async updateUser(): Promise<CustomUser | void> {
    if (this._user) {
      this._user = await this._firebaseService.getUserByUid(this._user.id);
      this.userState$.next(this._user);
      return this._user;
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
    await this.setUser(response.user);
    this._router.navigate(['/']);
  }

  // logout user
  async logout(redirectToHomePage: boolean): Promise<FirebaseAuthResponse | void> {
    this._firebaseService.logout();
    await this.setUser(null);
    if (redirectToHomePage) {
      this._router.navigate(['/']);
    }
  }

  ngOnDestroy() {
    this.userState$.complete();
  }

}
