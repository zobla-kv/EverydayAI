import { Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { Subscription, first } from 'rxjs'
import { NgxMasonryComponent } from 'ngx-masonry';

import * as ImagesLoaded from 'imagesloaded';

import {
  CustomUser,
  ProductFilters,
  ProductListConfig,
  ProductMapper,
  ProductResponse,
  ProductTypePrint,
  ToastConstants
} from '@app/models';

import {
  AuthService,
  FirebaseService,
  ToastService
} from '@app/services';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
})
export class ProductListComponent implements OnInit, OnChanges, OnDestroy {
  // list wrapper
  @ViewChild('listWrapper') listWrapper: ElementRef;
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

  // imgLoaded plugin
  imgLoaded: ImagesLoaded.ImagesLoaded;

  // img of products that didnt load
  failedImgLoadList: string[] = [];

  // only fetch products on first sub
  isFirstSub = true;

  constructor(
    private _authService: AuthService,
    private _firebaseService: FirebaseService,
    private _toast: ToastService
  ) {}

  // TODO: error handling
  ngOnInit(): void {
    this._firebaseService.isProductListFetching$.next(true);
    this.userStateSub$ = this._authService.userState$.subscribe(user => {
      this.user = user;

      if (this.isFirstSub) {
        // must be after user is loaded
        this._firebaseService.getProductsPaginated(this.filters, this.paginationSize).pipe(first()).subscribe(products => {
          this.handleProductsResponse(products);
          this.enableInfiniteScroll = true;
          this.isFirstSub = false;
        })
      }
    });
  }

  // handle product images loaded
  handleImagesLoaded() {
    this.failedImgLoadList = [];
    this.imgLoaded = ImagesLoaded(this.listWrapper.nativeElement);

    // all images loaded regardless of status
    this.imgLoaded.on('always', (instance) => {
      // remove those that didn't load
      this.productList = this.productList.filter(product => !this.failedImgLoadList.includes(product.watermarkImgPath));
      // 2 timeouts prevent spinner hide lag
      setTimeout(() => this.showSpinner = false, 400);
      setTimeout(() => {
        this.showProducts();
        this._firebaseService.isProductListFetching$.next(false);
      }, 410);
    });

    // singe image loaded
    this.imgLoaded.on('progress', (instance, image) => {
      const isLoaded = image?.isLoaded ? true : false;
      if (!isLoaded) {
        this.failedImgLoadList.push(image?.img.src as string);
      }

      // if all fail to load
      if (this.failedImgLoadList.length === this.paginationSize) {
        this._toast.open(ToastConstants.MESSAGES.PRODUCT_FAILED_TO_LOAD_PAGINATION, ToastConstants.TYPE.ERROR.type);
        this.enableInfiniteScroll = false;
      }
    });

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
    console.log('response: ', products);

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
    this.productList = products.map((product: any) => new ProductMapper<ProductTypePrint>(product, this.config, this.user));

    // wait for products to be in DOM
    setTimeout(() => {
      this.handleImagesLoaded();
    }, 500);
  }

  // trigger infinite scroll load
  // TODO: make it use handleProductsResponse
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
        this.productList.push(...mapped);
        this.showPaginationLoadingSpinner = false;
        setTimeout(() => {
          this.handleImagesLoaded();
        }, 500);
      }, 500);
    })
  }

  // animate show
  showProducts() {
    // it sets on previous items on pagination again, can be improved but no issues atm.
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
