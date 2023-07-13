import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AnimationEvent } from '@angular/animations';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

import { Subscription, concatMap, first, of, tap } from 'rxjs';

import {
  CustomUser,
  ProductMapper,
  ProductTypePrint,
  ProductResponse,
  ProductListConfig
} from '@app/models';

import {
  AuthService,
  FirebaseService,
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

  // config for list
  @Input('config') config: ProductListConfig;

  // full product list
  fullProductList: ProductResponse[] = [];

  // paginated list - this is displayed (with added FE properties)
  paginatedList: ProductMapper<ProductTypePrint>[] = [];

  // animate show/hide product items
  productVisibilityState = 'hide';

  // products loading spinner
  showSpinner = true;

  // number of loaded images
  numOfloadedImages = 0;

  // current user
  user: CustomUser | null;

  // user sub
  userStateSub$: Subscription;

  constructor(
    private _authService: AuthService,
    private _firebaseService: FirebaseService,
    private _utilService: UtilService
  ) {}

  // TODO: Important! error handling
  // TODO: keep data when routing (reuse strategy) so it wouldn't reach DB every time
  ngOnInit(): void {
    this.userStateSub$ = this._authService.userState$
    .pipe(
      concatMap((value, index) => {
        // trigger only on first emission (index 0)
        if (index === 0) {
          return of(value).pipe(tap(() => this.fetchProducts()))
        }
        return of(value)
      })
    )
    .subscribe(user => user && (this.user = user));
  }

  // fetch products from BE
  fetchProducts(): void {
    this._firebaseService.getProducts().pipe(first()).subscribe(products => {
      this.fullProductList = products;
      this.paginator.length = this.fullProductList.length;
      this.fullProductList.length === 0 && (this.showSpinner = false);
      this.updatePage();
    })
  }

  // TODO: runs on each page
  // TODO: maybe add checks (img.complete && img.naturalWidth ~) ?
  // TODO: Important! can also fail, do error handling (endpoint will return url but image is not available)
  handleImageLoaded() {
    if (++this.numOfloadedImages === this.paginatedList.length) {
      this.showSpinner = false;
    }
  }

  // show items depending on page
  updatePage() {
    this.updatePaginatedList()
    this.updatePageNumber();
    this.showProductItems();
  }

  // get items for next page
  updatePaginatedList(): void {
    // PAGINATION FORMULA
    // from: currentPageIndex * itemsPerPage
    // to:   (currentPageIndex + 1) * itemsPerPage - 1
    const productsForNextPage = this._utilService.getFromRange(
      this.fullProductList,
      this.paginator.pageIndex * this.config.pageSize,
      (this.paginator.pageIndex + 1) * this.config.pageSize - 1
    );
    this.paginatedList = productsForNextPage.map(product => new ProductMapper<ProductTypePrint>(product, this.config, this.user));
  }

  // handle pagination navigation
  handlePaginatorNagivation(event: PageEvent) {
    // flow: click on pagination navigation -> hide animation -> afterChangePageAnimation
    const direction = event.pageIndex > event.previousPageIndex! ? 'next' : 'previous';
    direction === 'next' ? this.hideProductsToTheLeft() : this.hideProductsToTheRight();
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
      this.updatePage();
      setTimeout(() => window.scroll({ top: 20, left: 0, behavior: 'smooth' }), 300);
    }
  }

  ngOnDestroy(): void {
    this.userStateSub$.unsubscribe();
  }
}
