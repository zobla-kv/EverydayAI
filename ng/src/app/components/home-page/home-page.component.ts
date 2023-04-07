import { Component } from '@angular/core';
import { Router } from '@angular/router';

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

  productCategories: ProductCategory[] = [
    { name: 'Food', icon: 'home-page-category-food' },
    { name: 'Toys', icon: 'home-page-category-food' },
    { name: 'Medicine', icon: 'home-page-category-food' },
    { name: 'Training', icon: 'home-page-category-food' }
  ];

  constructor(
    private _utilService: UtilService,
    private _router: Router
  ) {
    // NOTE: is loaded from another route
    const isLoadedFromAnotherRoute = Boolean(this._router.getCurrentNavigation()?.previousNavigation);  
  }

}
