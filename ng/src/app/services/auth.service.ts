import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { User } from '@angular/fire/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ReplaySubject, first, skip } from 'rxjs';

import {
  CustomUser,
  RegisterUser,
  FirebaseError,
  FirebaseConstants
} from '@app/models';

import {
  FirebaseService,
  UtilService,
  PreviousRouteService
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
  // ReplaySubject eliminates the need to have isLoadedFromAnother route
  // if subscribed too late, get previous value emitted value
  // those for pipe(first()) will NOT react to .updateUser, just on login/logout
  public userState$ = new ReplaySubject<CustomUser | null>(1);

  constructor(
    private _fireAuth: AngularFireAuth,
    private _firebaseService: FirebaseService,
    private _utilService: UtilService,
    private _router: Router,
    private _previousRouteService: PreviousRouteService
  ) {
    // auth coming from firebase
    this._fireAuth.onAuthStateChanged(async user => {
      // to counter firebase default auto login behaviour
      if (this._firebaseService.reverseFirebaseAutoLogin(user as User)) {
        this.logoutWithoutReload();
        return;
      }
      user ? this.setUser(<User>user) : this.setUser(null);
    });
  }

  // set custom user (transfer from firebase user to custom user)
  async setUser(user: User | null): Promise<void> {
    if (user) {
      // TODO: no error handling
      // could set user to null and cause problems
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
  // TODO: can be avoided by subscribing to db changes
  async updateUser(): Promise<CustomUser | void> {
    if (this._user) {
      // TODO: no error handling
      // could set user to null and cause problems
      this._user = await this._firebaseService.getUserByUid(this._user.id);
      this.userState$.next(this._user);
      return this._user;
    }
  }

  // register new user
  async register(user: RegisterUser): Promise<FirebaseError | void> {
    const response = await this._firebaseService.register(user);
    if (response) {
      return response;
    }
    this._utilService.navigateToInformationComponent(FirebaseError.getMessage(FirebaseConstants.REGISTRATION_SUCCESSFUL));
  }

  // login user
  async login(user: RegisterUser): Promise<FirebaseError | void> {
    const response = await this._firebaseService.login(user);
    if (response) {
      return response;
    }
    // skip old value from replaySubject (act as Subject)
    this.userState$.pipe(skip(1), first()).subscribe(() => {
      const previousRoute = this._previousRouteService.getPreviousUrl();
      // in case of email verification go back to home page and not previous route
      if (!previousRoute || previousRoute.includes('auth/verify')) {
        this._router.navigate(['/']);
        return;
      }
      this._router.navigateByUrl(previousRoute)
    });
  }

  // logout user and reload page
  async logoutWithReload(): Promise<FirebaseError | void> {
    await this._firebaseService.logout();
    window.location.reload();
  }

  // logout user
  async logoutWithoutReload(): Promise<FirebaseError | void> {
    await this._firebaseService.logout();
  }

  ngOnDestroy() {
    this.userState$ && this.userState$.complete();
  }

}
