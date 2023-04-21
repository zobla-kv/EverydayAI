import { AfterViewInit, Component, ElementRef } from '@angular/core';
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
  animations,
})
export class HomePageComponent implements AfterViewInit {

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
    private _router: Router,
    private _el: ElementRef
  ) {
    // NOTE: is loaded from another route
    const isLoadedFromAnotherRoute = Boolean(this._router.getCurrentNavigation()?.previousNavigation);
  }


  ngAfterViewInit() {
    // *** TOP SECTION ***
    const landingSection: HTMLElement = this._el.nativeElement.querySelector('.top-section-wrapper-new');
    // TODO: landing section fixes (zoom out and dev tools)
    landingSection.style.maxHeight = landingSection.offsetHeight + 'px';
    landingSection.style.minHeight = landingSection.offsetHeight + 'px';
    // *******************
    // *** ABOUT US SECTION ***
    // NOTE: fix for zoom out - required for .viewport-height when dynamic (responsive)
    // first set to 100vh then change to same size in pixels
    const aboutUsSection: HTMLElement = this._el.nativeElement.querySelector('.about-us-section-wrapper');
    aboutUsSection.style.minHeight = aboutUsSection.offsetHeight + 'px';
    // *******************

  }

}
