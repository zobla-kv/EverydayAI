import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { User, GoogleAuthProvider } from '@angular/fire/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ReplaySubject } from 'rxjs';

import {
  CustomUser,
  RegisterUser,
  FirebaseError,
  FirebaseConstants,
  LoginUser,
  ToastMessages
} from '@app/models';

import {
   FirebaseService,
   UtilService,
   ToastService,
   StorageService,
   SpinnerService,
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

  // did user trigger logout action
  private _logoutTriggered = false;


  constructor(
    private _fireAuth: AngularFireAuth,
    private _firebaseService: FirebaseService,
    private _utilService: UtilService,
    private _router: Router,
    private _toast: ToastService,
    private _storageService: StorageService,
    private _globalSpinner: SpinnerService
  ) {
    // auth coming from firebase
    this._fireAuth.onAuthStateChanged(user => {
      // to counter firebase default auto login behaviour
      if (this._firebaseService.reverseFirebaseAutoLogin(user as User)) {
        this.logoutWithoutReload();
        return;
      }

      // if user initiated logout to prevent header flick
      if (!user && this._logoutTriggered) {
        window.location.reload();
        return;
      }

      // if user was not authenticated at all
      if (!user) {
        this._setUser(null);
        // hide spinner that was set on app load
        this._globalSpinner.hide();
        return;
      }

      this._handleAuth(user as User);
    });
  }

  // handle succesful authentication
  private async _handleAuth(user: User): Promise<void> {
    try {
      const customUser = await this._firebaseService.getUserByUid(user.uid);

      if (this._isGoogleAuth(user) && !customUser) {
        // Google login and user not found in database
        const newCustomUser = await this._firebaseService.addGoogleUserToDb(user as User);
        this._setUser(newCustomUser);
      } else {
        // User found in database or non-Google authentication
        this._setUser(customUser);
      }

      if (this._storageService.getFromSessionStorage(this._storageService.storageKey.STORED_ROUTE)) {
        this._navigateAfterLogin();
      }

      // hide spinner that was set on app load
      this._globalSpinner.hide();
    }
    catch(err) {
      this.logoutWithoutReload();
      this._toast.showErrorMessage(ToastMessages.AUTH_FAILED);
    }
  }

  // set custom user
  private _setUser(user: CustomUser | null): void {
    this._user = user;
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
  async login(user: LoginUser): Promise<FirebaseError | void> {
    const response = await this._firebaseService.login(user);
    if (response) {
      return response;
    }
    window.location.reload();
  }

  // logout user and reload page
  async logoutWithReload(): Promise<FirebaseError | void> {
    this._logoutTriggered = true;
    this._firebaseService.logout();
  }

  // logout user
  async logoutWithoutReload(): Promise<FirebaseError | void> {
    this._firebaseService.logout();
  }

  // is user logged in using google
  private _isGoogleAuth(user: any): boolean {
    return user?.providerData[0]?.providerId === GoogleAuthProvider.PROVIDER_ID;
  }

  // login using google auth
  async loginWithGoogle(): Promise<any> {
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');
    provider.addScope('https://www.googleapis.com/auth/user.birthday.read');
    this._storageService.storeToSessionStorage(this._storageService.storageKey.GOOGLE_AUTH, '1');
    return this._fireAuth.signInWithRedirect(provider);
  }

  // navigate user after succesful login
  private _navigateAfterLogin() {
    let previousRoute = this._storageService.getFromSessionStorage(this._storageService.storageKey.STORED_ROUTE);

    // in case of email verification go back to home page and not previous route
    if (!previousRoute || previousRoute.includes('auth/verify')) {
      this._router.navigate(['/']);
      return;
    }

    this._storageService.deleteFromSessionStorage(this._storageService.storageKey.STORED_ROUTE);
    this._router.navigateByUrl(previousRoute);
  }

  ngOnDestroy() {
    this.userState$ && this.userState$.complete();
  }

}
