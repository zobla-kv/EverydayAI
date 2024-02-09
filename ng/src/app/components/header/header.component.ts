import { Component, ElementRef, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription, first } from 'rxjs';

import {
  AuthService,
  FirebaseService,
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

  // current screen size
  currentScreenSize: string;

  // expand when user scroll is on top
  expand = false;

  // is user logged in
  isAuthenticated: boolean;

  // is user admin
  isAdmin: boolean;

  // number of items in cart
  numberOfItemsInCart = 0;

  // subscibe to user state (change to number of cart items etc.)
  customUserState$: Subscription;

  // subscibe to screen size change
  screenSizeChangeSub$: Subscription;

  // search input value
  searchValue = '';

  // previous Y position - for calculating scroll direction
  private _prevY = 0;

  constructor(
    private _router: Router,
    private _utilService: UtilService,
    private _authService: AuthService,
    private _storageService: StorageService,
    private _firebaseService: FirebaseService
  ) {

    // *** avoid flickering ***
    this._storageService.getUserFromLocalStorage() && (this.isAuthenticated = true);
    this._storageService.getNumberOfItemsInCart() && (this.numberOfItemsInCart = this._storageService.getNumberOfItemsInCart());
    // ************************

    this.customUserState$ = this._authService.userState$.subscribe(user => {
      this.numberOfItemsInCart = user ? user.cart.length : 0;
      this.isAuthenticated = !!user;
      this.isAdmin = user?.role === 'admin' ? true : false;
    });

    const scrollHandler = this.handleScroll.bind(this);
    this.screenSizeChangeSub$ = this._utilService.screenSizeChange$.subscribe(size => {
      this.currentScreenSize = size;
      if (['xl', 'lg', 'md'].includes(this.currentScreenSize)) {
        window.addEventListener('scroll', scrollHandler);
      } else {
        window.removeEventListener('scroll', scrollHandler);
      }
    });

    this._router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // close hamburger on route leave
        this.closeHamburgerMenu();
      }
    });

    this._firebaseService.search$.pipe(first()).subscribe(value => this.searchValue = value);

  }

  // handle scroll event
  handleScroll() {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    if (scrollY > this._prevY) {
      !this.expand && this.expandHeader();
    } else if (scrollY < this._prevY) {
      this.expand && this.collapseHeader();
    }
    this._prevY = scrollY;
  }

  // handle search (triggered on x)
  handleSearch(ev: Event) {
    const newValue = (ev.target as HTMLInputElement).value;
    const oldValue = this.searchValue;

    this.searchValue = newValue;

    const currentRoute = this._router.url;

    // if on images page
    if (currentRoute.includes('images')) {
      // allow empty search only if there is old value (to reset)
      if (newValue === '' && !oldValue) {
        return;
      }
      this._firebaseService.search$.next(newValue);
      return;
    }

    // dont allow empty if not on images page
    if (newValue === '') {
      return;
    }

    // navigate to images page
    this._router.navigate(['images'], {
      queryParams: { 'search': this.searchValue },
      queryParamsHandling: 'merge',
    });

  }

  // trigger header expand animation
  expandHeader() {
    this.expand = true;
  }

  // trigger header collapse animation
  collapseHeader() {
    this.expand = false;
  }

  // close hamburger menu
  closeHamburgerMenu() {
    this.hamburgerToggle && (this.hamburgerToggle.nativeElement.checked = false);
  }

  handleAuthButton(type: string) {
    const prevRoute = this._router.url;
    if (prevRoute.includes('auth/login') || prevRoute.includes('auth/register')) {
      // switch between forms when already on that route
      this._utilService.authButtonClick$.next(type);
    } else {
      this._router.navigate(['auth', type]);
    }
  }

  // log user out
  handleLogout() {
    this.hamburgerToggle && this.closeHamburgerMenu();
    this._authService.logoutWithReload();
  }

  ngOnDestroy() {
    this.customUserState$ && this.customUserState$.unsubscribe();
    this.screenSizeChangeSub$ && this.screenSizeChangeSub$.unsubscribe();
  }

}
