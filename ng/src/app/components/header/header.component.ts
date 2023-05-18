import { Component, ElementRef, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
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

  // hamburger menu toggle
  @ViewChild('hamburgerToggle') hamburgerToggle: ElementRef;

  @HostListener('window:scroll', ['$event']) 
  onScroll(event: any) {
    // check if user reached bottom of the page then show footer
    if (window.pageYOffset === 0) {
      !this.expand && this.expandHeader();
    } else {
      this.expand && this.collapseHeader();
    }
  }

  // current screen size
  currentScreenSize: string;

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

  // subscibe to screen size change
  screenSizeChangeSub$: Subscription;

  constructor(
    private _router: Router,
    private _utilService: UtilService,
    private _authService: AuthService,
    private _storageService: StorageService
  ) {

    // *** avoid flickering ***
    this._storageService.getUserFromLocalStorage() && (this.isAuthenticated = true);
    this._storageService.getNumberOfItemsInCart() && (this.numberOfItemsInCart = this._storageService.getNumberOfItemsInCart());
    // ************************

    this.customUserState$ = this._authService.userState$.subscribe(user => {
      this.numberOfItemsInCart = user ? user.cart.items.length : 0;
      this.isAuthenticated = !!user;
    });

    this._router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // close hamburger on route leave
        this.closeHamburgerMenu();
      }

    this._utilService.screenSizeChange$.subscribe(size => this.currentScreenSize = size);
  });

  }

  // trigger header expand animation
  expandHeader() {
    this.expand = true;
    this._utilService.scrolledToTop$.next(true);
  }

  // trigger header collapse animation
  collapseHeader() {
    this.expand = false;
    this._utilService.scrolledToTop$.next(false);
  }

  // close hamburger menu
  closeHamburgerMenu() {
    this.hamburgerToggle && (this.hamburgerToggle.nativeElement.checked = false);
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
    this.hamburgerToggle && this.closeHamburgerMenu();
    this._authService.logout(true);
  }

  ngOnDestroy() {
    this.customUserState$.unsubscribe();
    this.screenSizeChangeSub$.unsubscribe();
  }

}
