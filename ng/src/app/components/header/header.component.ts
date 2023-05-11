import { Component, HostListener, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import {
  AuthService,
  StorageService,
  UtilService
} from '@app/services';

import animations from './header.animations';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations
})
export class HeaderComponent implements OnDestroy {

  @HostListener('window:scroll', ['$event']) 
  onScroll(event: any) {
    // check if user reached bottom of the page then show footer
    if (window.pageYOffset === 0) {
      !this.expand && this.expandHeader();
    } else {
      this.expand && this.collapseHeader();
    }
  }

  // expand when user scroll is on top
  expand = true;

  // is first visit
  isFirstVisit = this._utilService.isFirstVisit();

  // is user logged in
  isAuthenticated: boolean;

  // number of items in cart
  numberOfItemsInCart = 0;

  // subscibe to user state (change to number of cart items etc.)
  customUserState$: Subscription;

  constructor(
    private _router: Router,
    private _utilService: UtilService,
    private _authService: AuthService,
    private _storageService: StorageService
  ) {

    // *** avoid flickering ***
    this._storageService.getUserFromSessionStorage() && (this.isAuthenticated = true);
    this._storageService.getNumberOfItemsInCart() && (this.numberOfItemsInCart = this._storageService.getNumberOfItemsInCart());
    // ************************

    this.customUserState$ = this._authService.userState$.subscribe(user => {
      this.numberOfItemsInCart = user ? user.cart.items.length : 0;
      this.isAuthenticated = !!user;
    })

  }

  // trigger header expand animation
  expandHeader() {
    this.expand = true;
  }

  // trigger header collapse animation
  collapseHeader() {
    this.expand = false;
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

  ngOnDestroy() {
    this.customUserState$.unsubscribe();
  }

}
