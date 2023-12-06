import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, first } from 'rxjs'

import {
  CustomUser,
  ProductListConfig,
  ProductMapper,
  ProductTypePrint
} from '@app/models';

import {
  AuthService,
  FirebaseService
} from '@app/services';
import { response } from 'express';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
})
export class ProductListComponent implements OnInit, OnDestroy {

  // list config - reusing old to avoid rewrite
  config = ProductListConfig.PRODUCT_LIST_PRINTS.TAB_SHOP;

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

  // pagination size
  paginationSize = 6;

  // are all products loaded?
  allProductsLoaded = false;

  constructor(
    private _authService: AuthService,
    private _firebaseService: FirebaseService
  ) {}

  // TODO: Important! error handling
  // NOTE: keep data when routing (reuse strategy) so it wouldn't reach DB every time
  ngOnInit(): void {
    this.userStateSub$ = this._authService.userState$.subscribe(user => this.user = user);
    this._firebaseService.getProductsPaginated(this.paginationSize).pipe(first()).subscribe(products => {
      if (products.length === 0) {
        this.showSpinner = false;
        return;
      }

      // TODO: bug, initial set of images displayed before being fully rendered
      // not a problem with later ones

      this.showSpinner = false;
      this.productList = products.map((product: any) => new ProductMapper<ProductTypePrint>(product, this.config, this.user));
    })
  }

  loadMore() {
    // prevent multiple calls on rapid scroll up and down
    if (this.showPaginationLoadingSpinner || this.allProductsLoaded) {
      return;
    }
    this.showPaginationLoadingSpinner = true;
    this._firebaseService.getProductsPaginated(this.paginationSize).pipe(first()).subscribe(products => {
      // TODO: only for spinner to show longer
      setTimeout(() => {
        // products length being 0 or smaller than pagination size means there are no more items
        if (products.length === 0 || products.length < this.paginationSize) {
          this.allProductsLoaded = true;
        }
        const mapped = products.map((product: any) => new ProductMapper<ProductTypePrint>(product, this.config, this.user));
        this.showPaginationLoadingSpinner = false;
        this.productList.push(...mapped)
      }, 500);
    })
  }

  ngOnDestroy() {
    this.userStateSub$ && this.userStateSub$.unsubscribe();
    // TODO: check how this behaves with reuse strategy
    this._firebaseService.lastLoadedWithPagination = null;
  }

}
