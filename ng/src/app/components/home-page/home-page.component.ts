import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';

import {
  ProductCategory
} from '@app/models';

import {
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

  productCategories: ProductCategory[] = [
    { name: 'Food', icon: 'home-page-category-food' },
    { name: 'Toys', icon: 'home-page-category-food' },
    { name: 'Medicine', icon: 'home-page-category-food' },
    { name: 'Training', icon: 'home-page-category-food' }
  ];

  constructor(
    private _utilService: UtilService,
    private _fireAuth: AngularFireAuth
  ) {

    this._fireAuth.onAuthStateChanged(() => this.triggerAnimation());

  }

  triggerAnimation() {
    this.loadingState = 'loadingEnded';
  }

  onVisible(event: HTMLElement) {
    console.log('visible fired: ', event);
  }

}
