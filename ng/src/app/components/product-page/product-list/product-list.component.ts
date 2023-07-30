import { Component, ElementRef, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { AnimationEvent } from '@angular/animations';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

import { Subscription, first } from 'rxjs';

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
export class ProductListComponent implements OnInit {

  // for animation
  @ViewChild('productList') productList: ElementRef;
  @ViewChild('paginator') paginator: MatPaginator;

  // config for list
  @Input('config') config: ProductListConfig;

  // full product list
  fullProductList: ProductResponse[] = [];

  // paginated list - this is displayed (with added FE properties)
  paginatedList: ProductMapper<ProductTypePrint>[] = [];

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
    private _utilService: UtilService,
    private _element: ElementRef,
    private _renderer: Renderer2
  ) {}

  // TODO: Important! error handling
  // NOTE: keep data when routing (reuse strategy) so it wouldn't reach DB every time
  ngOnInit(): void {
    this.userStateSub$ = this._authService.userState$.pipe(first()).subscribe(user => {
      this.user = user;
      this.fetchProducts(this.config.product.type, this.user);
    });
  }
  
  // fetch products from BE
  fetchProducts(productType: any, user: CustomUser | null): void {
    this._firebaseService.getProducts(productType, user).pipe(first()).subscribe(products => {
      this.fullProductList = products;
      this.paginator.length = this.fullProductList.length;
      this.fullProductList.length === 0 && (this.showSpinner = false);
      this.updatePage();
    })
  }

  // TODO: runs on each page
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
    this.hideProducts();
  }

  // updates page number in pagination
  updatePageNumber() {
    const list = this._element.nativeElement.querySelectorAll('.mat-mdc-paginator-range-label')[0];
    list && (list.innerHTML = 'Page: ' + (this.paginator.pageIndex + 1) + '/' + this.paginator.getNumberOfPages());
  }

  // trigger show animation
  showProductItems() {
    this._renderer.removeClass(this.productList.nativeElement, 'fade-out');
  }
  hideProducts() {
    this._renderer.addClass(this.productList.nativeElement, 'fade-out');
    this.updatePageAfterAnimation();
  }

  updatePageAfterAnimation() {
    // time should match css transition
    setTimeout(() => {
      this.updatePage();
      this.showProductItems();
    }, 300);
  }

}
