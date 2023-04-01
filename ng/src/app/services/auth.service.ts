import { Injectable } from '@angular/core';
import { User } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

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
  public userState$ = new Subject<CustomUser | null>();

  constructor(
    private _firebaseService: FirebaseService,
    private _utilService: UtilService,
    private _router: Router
  ) { }

  // set custom user (transfer from firebase user to custom user)
  async setUser(user: User | null): Promise<void> {
    // TODO: what happens if db call fails
    // two users would be out of sync (fb user is there but custom isn't)
    // some error handling needed?
    console.log('set user fired');
    if (user) {
      this._user = await this._firebaseService.getUserByUid(user.uid);
    } else {
      this._user = null;
    }
    console.log('emitted: ', this._user);
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
    // TODO: causes user to be emitted twice, but this only happens on login
    // check if this causes any issues?
    // one way to eliminate is to check what method called setUser 
    // and not trigger .next if it was 'login' method
    await this.setUser(response.user);
    this._router.navigate(['/']);
  }

  // logout user
  async logout(): Promise<FirebaseAuthResponse | void> {
    this._firebaseService.logout();
    this.setUser(null);
    this._router.navigate(['/']);
  }

  ngOnDestroy() {
    this.userState$.complete();
  }

}
