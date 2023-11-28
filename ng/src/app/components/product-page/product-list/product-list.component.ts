import { Component, ElementRef, Input, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

import { Subscription, first, Subject } from 'rxjs';

import {
  CustomUser,
  ProductMapper,
  ProductTypePrint,
  ProductResponse,
  ProductListConfig,
  ProductType
} from '@app/models';

import {
  AuthService,
  HttpService,
  ProductService,
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
    private _utilService: UtilService,
    private _element: ElementRef,
    private _renderer: Renderer2,
    private _httpService: HttpService
  ) {}

  // TODO: Important! error handling
  // NOTE: keep data when routing (reuse strategy) so it wouldn't reach DB every time
  ngOnInit(): void {
    this.userStateSub$ = this._authService.userState$.subscribe(user => {
      this.user = user;
      this.fetchProducts(this.config.product.type, this.user);
    });
  }

  // fetch products from BE
  fetchProducts(productType: any, user: CustomUser | null): void {
    this._httpService.getProducts(productType, user).pipe(first()).subscribe((products: any) => {
      // console.log('products: ', products)
      this.fullProductList = this.sortList(products);
      this.paginator.length = this.fullProductList.length;
      this.fullProductList.length === 0 && (this.showSpinner = false);
      this.updatePage();
    })
  }

  // TODO: runs on each page
  handleImageLoaded() {
    if (++this.numOfloadedImages === this.paginatedList.length) {
      this.paginatedList = this.remove404Products(this.paginatedList);
      setTimeout(() => {
        this.showSpinner = false;
      }, 500);
    }
  }

  // sort list based on type
  sortList(products: ProductResponse[]): ProductResponse[] {
    const listType = this.config.product.type;
    switch(listType) {
      case ProductType.PRINTS.SHOP:
        return this._utilService.sortByCreationDate(products);
      case ProductType.PRINTS.OWNED_ITEMS:
        return this._utilService.sortByOwnedSince(products, this.user);
      default:
        return products;
    }
  }

  // remove products which image failes to load
  // TODO: if it is called remove404 why switch inside, call it only if needed
  remove404Products(products: ProductMapper<ProductTypePrint>[]): ProductMapper<ProductTypePrint>[] {
    const listType = this.config.product.type;
      switch(listType) {
      case ProductType.PRINTS.SHOP:
        return products.filter(product => !product.imgPath.includes('assets'));
      case ProductType.PRINTS.OWNED_ITEMS:
        // display 404 on owned items
        return products;
      default:
        return products;
    }
  }

  // show items depending on page
  updatePage() {
    this.updatePaginatedList();
    this.updatePageNumber();
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

  // updates page number in pagination
  updatePageNumber() {
    const list = this._element.nativeElement.querySelectorAll('.mat-mdc-paginator-range-label')[0];
    const currentPage = this.paginator.pageIndex + 1;
    const totalPages = this.paginator.getNumberOfPages() === 0 ? 1 : this.paginator.getNumberOfPages();
    list && (list.innerHTML = 'Page: ' + currentPage + '/' + totalPages);
  }

  // handle pagination navigation
  // attach scroll listener for animation to run once scroll hits top position and remove it afterwards
  handlePaginatorNagivation() {
    const handleScroll = () => {
      if (window.scrollY < 30) {
        this.changePage();
        window.removeEventListener('scroll', handleScroll);
      }
    }
    // fire without scroll
    if (window.scrollY < 30) {
      this.changePage();
      return;
    }
    window.addEventListener('scroll', handleScroll);
    window.scrollTo({ top: 20, behavior: 'smooth' });
  }

  // run change page animation and load new items
  async changePage() {
    setTimeout(() => this._renderer.addClass(this.productList.nativeElement, 'fade-out'), 200);
    setTimeout(() => {
      this.updatePage();
      this._renderer.removeClass(this.productList.nativeElement, 'fade-out');
    }, 500);
  }

  ngOnDestroy() {
    this.userStateSub$ && this.userStateSub$.unsubscribe();
  }

}
