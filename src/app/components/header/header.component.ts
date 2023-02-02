import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import {
  AuthService,
  HeaderEventsService
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
    private router: Router,
    private headerEventsService: HeaderEventsService,
    private authService: AuthService
  ) {

    this.userSub$ = this.authService.user.subscribe(user => {
      this.isAuthenticated = user.token;
    })

  }

  // handle route change to log/reg form
  handleAuthButton(type: string) {
    const prevRoute = this.router.url;
    if (prevRoute.includes('auth')) {
      // switch between forms when already on that route
      this.headerEventsService.fireAuthButtonClicked(type);
    } else {
      this.router.navigate(['auth', type]);
    }
  }

  ngOnDestroy(): void {
    this.userSub$.unsubscribe();
  }

}
