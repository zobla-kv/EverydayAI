import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { Subscription, first } from 'rxjs'
import { NgxMasonryComponent } from 'ngx-masonry';

import {
  CustomUser,
  ProductFilters,
  ProductListConfig,
  ProductMapper,
  ProductResponse,
  ProductTypePrint
} from '@app/models';

import {
  AuthService,
  FirebaseService
} from '@app/services';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
})
export class ProductListComponent implements OnInit, OnChanges ,OnDestroy {

  // masonry ref
  @ViewChild(NgxMasonryComponent) masonry: NgxMasonryComponent;

  // active filters
  @Input() filters: ProductFilters;

  // list config - reusing old to avoid rewrite
  config = ProductListConfig.PRODUCT_LIST;

  // current user
  user: CustomUser | null;

  // user sub
  userStateSub$: Subscription;

  // product list
  productList: ProductMapper<ProductTypePrint>[] = [];

  // products initial loading spinner
  showSpinner = true;

  // pagination loading spinner
  showPaginationLoadingSpinner = false;

  // TODO: increase number
  // pagination size
  paginationSize = 6;

  // are all products loaded?
  allProductsLoaded = false;

  // prevent infinite scroll on load
  enableInfiniteScroll = false;

  // filter no results message
  showFilterNoResults = false;

  constructor(
    private _authService: AuthService,
    private _firebaseService: FirebaseService
  ) {}

  // TODO: error handling
  ngOnInit(): void {
    this._firebaseService.isProductListFetching$.next(true);
    this.userStateSub$ = this._authService.userState$.subscribe(user => this.user = user);
    this._firebaseService.getProductsPaginated(this.filters, this.paginationSize).pipe(first()).subscribe(products => {
      this.handleProductsResponse(products);
      this.enableInfiniteScroll = true;
    })
  }

  // on input (filter) change
  ngOnChanges(changes: SimpleChanges): void {
    // skip trigger on load
    if (changes['filters'].previousValue) {
      // TODO: prevent call on another filter if there are no items already
      this._firebaseService.isProductListFetching$.next(true);
      this.resetInfiniteScrollFlags();
      this.hideProducts();
      setTimeout(() => {
        this.productList = [];
        this.showSpinner = true;
        this._firebaseService.getProductsPaginated(this.filters, this.paginationSize).pipe(first()).subscribe(products => {
          // for load animation to show longer
          setTimeout(() => this.handleProductsResponse(products), 600);
        })
      }, 1000)
    }
  }

  // reset flags that affect infinite scroll;
  resetInfiniteScrollFlags() {
    this._firebaseService.resetPagination();
    this.allProductsLoaded = false;
    this.showFilterNoResults = false;
  }

  // handle products fetch
  handleProductsResponse(products: ProductResponse[]) {
    console.log('response: ', products)

    if (products.length === 0) {
      this.showSpinner = false;
      this.showFilterNoResults = true;
      this._firebaseService.isProductListFetching$.next(false);
      return;
    }

    if (products.length < this.paginationSize) {
      this.allProductsLoaded = true;
    }

    // TODO: bug, initial set of images displayed before being fully rendered (big size?) - not a problem with later ones

    this.showSpinner = false;
    this.productList = products.map((product: any) => new ProductMapper<ProductTypePrint>(product, this.config, this.user));
    setTimeout(() => {
      this.showProducts();
      this._firebaseService.isProductListFetching$.next(false);
    }, 300)
  }

  loadMore() {
    // prevent multiple calls on rapid scroll up and down
    if (!this.enableInfiniteScroll || this.showPaginationLoadingSpinner || this.allProductsLoaded || this.showFilterNoResults) {
      return;
    }
    this._firebaseService.isProductListFetching$.next(true);
    this.showPaginationLoadingSpinner = true;
    this._firebaseService.getProductsPaginated(this.filters, this.paginationSize).pipe(first()).subscribe(products => {
      // only for spinner to show longer
      setTimeout(() => {
        // products length being 0 or smaller than pagination size means there are no more items
        if (products.length === 0 || products.length < this.paginationSize) {
          this.allProductsLoaded = true;
        }
        const mapped = products.map((product: any) => new ProductMapper<ProductTypePrint>(product, this.config, this.user));
        this.productList.push(...mapped)
        this.showPaginationLoadingSpinner = false;
        setTimeout(() => {
          this.showProducts();
          this._firebaseService.isProductListFetching$.next(false);
        }, 100)
      }, 500);
    })
  }

  // animate show
  showProducts() {
    this.masonry.masonryInstance.items.forEach((item: any) => {
      const element: HTMLElement = item.element;
      const productItem = element.children[0].children[0];
      productItem.classList.remove('hide');
      productItem.classList.add('show');
    })
  }
  // animate hide
  hideProducts() {
    this.masonry.masonryInstance.items.forEach((item: any) => {
      const element: HTMLElement = item.element;
      const productItem = element.children[0].children[0];
      productItem.classList.remove('show');
      productItem.classList.add('hide');
    })
  }

  ngOnDestroy() {
    this.userStateSub$ && this.userStateSub$.unsubscribe();
    this._firebaseService.resetPagination();
  }

}
