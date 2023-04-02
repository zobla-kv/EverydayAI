import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import {
  ProductCategory
} from '@app/models';

import {
  AuthService,
  UtilService
} from '@app/services';

import animations from './home-page.animations';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
  animations
})
export class HomePageComponent {

  // is first visit
  isFirstVisit = this._utilService.isFirstVisit();

  // animation state
  loadingState = 'loadingStarted';

  // subscibe to user state (change to number of cart items etc.)
  customUserState$: Subscription;

  productCategories: ProductCategory[] = [
    { name: 'Food', icon: 'home-page-category-food' },
    { name: 'Toys', icon: 'home-page-category-food' },
    { name: 'Medicine', icon: 'home-page-category-food' },
    { name: 'Training', icon: 'home-page-category-food' }
  ];

  constructor(
    private _utilService: UtilService,
    private _authService: AuthService,
    private _router: Router
  ) {
    const isLoadedFromAnotherRoute = Boolean(this._router.getCurrentNavigation()?.previousNavigation);
    if (isLoadedFromAnotherRoute) {
      // fires on change page because user is not emitted in that case
      this.triggerAnimation();
    } else {
      // fires on initial load after custom user object is stored
      this.customUserState$ = this._authService.userState$.subscribe(() => this.triggerAnimation());
    }   

  }

  triggerAnimation() {
    this.loadingState = 'loadingEnded';
  }

  ngOnDestroy() {
    this.customUserState$ && this.customUserState$.unsubscribe();
  }

}
