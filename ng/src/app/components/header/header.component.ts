import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AngularFireAuth } from '@angular/fire/compat/auth';

import {
  AuthService,
  UtilService
} from '@app/services';

import animations from './header.animations';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations
})
export class HeaderComponent {

  // is first visit
  isFirstVisit = this._utilService.isFirstVisit();

  // animation state
  loadingState = 'loadingStarted';

  isAuthenticated: boolean;

  constructor(
    private _router: Router,
    private _utilService: UtilService,
    private _authService: AuthService,
    private _fireAuth: AngularFireAuth,
  ) {

    if (this._authService.getUser()) {
      console.log('fired');
      this.isAuthenticated = true
    }
    // this._authService.getUser() && (this.isAuthenticated = true);

    this._fireAuth.onAuthStateChanged(user => {
      this.isAuthenticated = !!user;
      this.triggerAnimation();
      console.log('get user: ', this._authService.getUser())
    });
  }

  triggerAnimation() {
    this.loadingState = 'loadingEnded';
  }

  // TODO: block routes if logged in
  handleAuthButton(type: string) {
    const prevRoute = this._router.url;
    if (prevRoute.includes('auth/login') || prevRoute.includes('auth/register')) {
      // switch between forms when already on that route
      this._utilService.fireAuthButtonClicked(type);
    } else {
      this._router.navigate(['auth', type]);
    }
  }

  // log user out
  handleLogout() {
    this._authService.logout();
  }

}
