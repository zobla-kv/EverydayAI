import { Component, Input, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { AnimationEvent } from '@angular/animations';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

import { Subscription } from 'rxjs';

import {
  CustomUser,
  Product,
  ProductActions,
} from '@app/models';

import {
  AuthService,
  UtilService
} from '@app/services';

import animations from './product-list.animations';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
  animations
})
export class ProductListComponent implements OnInit, OnDestroy {

  @ViewChild('paginator') paginator: MatPaginator;

  // list title
  @Input('title') title: string;
  // number of items per page
  @Input('pageSize') pageSize: number;
  // actions items in list can perform
  @Input('actions') actions: string[];
  @Input('products')
  get fullProductList(): Product[] {
    return this._fullProductList;
  }
  set fullProductList(products: Product[]) {
    this._fullProductList = products;
    this._fullProductList.length === 0 && (this.showSpinner = false);
    if (this._fullProductList.length > 0) {
      if (this.user && this.actions.includes(ProductActions.CART)) {
        // add isInCart property
        this.fullProductList.forEach(product => {
          product.isInCart = this.user?.cart.items.findIndex(item => item.id === product.id) !== -1 ? true : false;
        });
      }
      this.paginator.length = this.fullProductList.length;
      this.updatePageInfo();
    }
  }

  // full product list
  _fullProductList: Product[];

  // paginated list - this is displayed
  paginatedList: Product[];

  // animate show/hide product items
  productVisibilityState = 'hide';

  // products loading spinner
  showSpinner = false;

  // number of loaded images
  numOfloadedImages = 0;

  // current user
  user: CustomUser | null;

  // user sub
  userStateSub$: Subscription;

  constructor(
    private _authService: AuthService,
    private _utilService: UtilService
  ) {}

  ngOnInit(): void {
    this.showSpinner = true;
    this.userStateSub$ = this._authService.userState$.subscribe(user => user && (this.user = user));
  }

  // TODO: runs on each page
  // TODO: maybe add checks (img.complete && img.naturalWidth ~) ?
  // TODO: Important! can also fail, do error handling (endpoint will return url but image is not available)
  handleImageLoaded() {
    if (++this.numOfloadedImages === this.paginatedList.length) {
      this.showSpinner = false;
    }
  }

  // handle pagination navigation
  handlePaginatorNagivation(event: PageEvent) {
    // flow: click on pagination navigation -> hide animation -> afterChangePageAnimation
    const direction = event.pageIndex > event.previousPageIndex! ? 'next' : 'previous';
    direction === 'next' ? this.hideProductsToTheLeft() : this.hideProductsToTheRight();
  }

  // show items depending on page
  updatePageInfo() {
    // PAGINATION FORMULA
    // from: currentPageIndex * itemsPerPage
    // to:   (currentPageIndex + 1) * itemsPerPage - 1
    this.paginatedList = this._utilService.getFromRange(
      this.fullProductList,
      this.paginator.pageIndex * this.pageSize,
      (this.paginator.pageIndex + 1) * this.pageSize - 1
    );
    this.updatePageNumber();
    this.showProductItems();
  }

  // updates page number in pagination
  updatePageNumber() {
    const list = document.getElementsByClassName('mat-mdc-paginator-range-label');
    list[0] && (list[0].innerHTML = 'Page: ' + (this.paginator.pageIndex + 1) + '/' + this.paginator.getNumberOfPages());
  }

  // trigger show animation
  showProductItems() {
    this.productVisibilityState = 'show';
  }
  hideProductsToTheLeft() {
    this.productVisibilityState = 'hideLeft';
  }
  hideProductsToTheRight() {
    this.productVisibilityState = 'hideRight';
  }

  // update page after hide animation is complete
  afterChangePageAnimation(ev: AnimationEvent) {
    if (ev.fromState === 'show' && ev.toState !== 'void') {
      this.updatePageInfo();
      setTimeout(() => window.scroll({ top: 20, left: 0, behavior: 'smooth' }), 300);
    }
  }

  ngOnDestroy(): void {
    this.userStateSub$.unsubscribe();
  }
}
