import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import {
  AuthService,
  UtilService
} from '@app/services';

import {
  User,
  FormType
} from '@app/models';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnDestroy {

  isAuthenticated: boolean;
  userSub$: Subscription;

  constructor(
    private _router: Router,
    private _utilService: UtilService,
    private _authService: AuthService
  ) {

    this.userSub$ = this._authService.user.subscribe((user: User) => {
      this.isAuthenticated = user.token ? true : false;
    })

  }

  // handle route change to log/reg form
  // TODO: block routes if logged in
  handleAuthButton(type: string) {
    const prevRoute = this._router.url;
    if (prevRoute.includes('auth')) {
      // switch between forms when already on that route
      this._utilService.fireAuthButtonClicked(type);
    } else {
      this._router.navigate(['auth', type]);
    }
  }

  ngOnDestroy(): void {
    this.userSub$.unsubscribe();
  }

}
