import { Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild, Renderer2, ViewContainerRef } from '@angular/core';
import { Subscription, first } from 'rxjs'

import { ProductItemComponent } from '@app/components';

import * as ImagesLoaded from 'imagesloaded';
declare const Packery: any;

import {
  CustomUser,
  ProductFilters,
  ProductListConfig,
  ProductMapper,
  ProductResponse,
  ToastMessages
} from '@app/models';

import {
  AuthService,
  FirebaseService,
  ToastService,
  UtilService
} from '@app/services';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
})
export class ProductListComponent implements OnInit, OnChanges, OnDestroy {
  // list wrapper
  @ViewChild('listWrapper') listWrapper: ElementRef;
  @ViewChild('grid') grid: ElementRef;

  // active filters
  @Input() filters: ProductFilters;

  // list config - reusing old to avoid rewrite
  config = ProductListConfig.PRODUCT_LIST;

  // current user
  user: CustomUser | null;

  // user sub
  userStateSub$: Subscription;

  // product list
  productList: ProductMapper[] = [];

  // packery grid
  packery: any;

  // products initial loading spinner
  showSpinner = true;

  // pagination loading spinner
  showPaginationLoadingSpinner = false;

  // pagination size
  paginationSize = 40;

  // how many times did pagination load new items?
  paginationLoadedTimes = 0;

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

  // prevZoomLevel - for fixing broken layout
  prevZoomLevel: number = 0;

  constructor(
    private _authService: AuthService,
    private _firebaseService: FirebaseService,
    private _utilService: UtilService,
    private _toast: ToastService,
    private _renderer: Renderer2,
    private _viewContainerRef: ViewContainerRef
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
  handleImagesLoaded(appendToGrid: boolean) {
    this.failedImgLoadList = [];
    this.imgLoaded = ImagesLoaded(this.listWrapper.nativeElement);

    // all images loaded regardless of status
    this.imgLoaded.on('always', (instance) => {
      // remove those that didn't load
      this.productList = this.productList.filter(product => !this.failedImgLoadList.includes(product.watermarkImgPath));
      // timeout prevents spinner hide lag
      this.showSpinner = false;
      setTimeout(() => {
        this.createGrid(appendToGrid);
        this._firebaseService.isProductListFetching$.next(false);
      }, 10);
    });

    // singe image loaded
    this.imgLoaded.on('progress', (instance, image) => {
      const isLoaded = image?.isLoaded ? true : false;
      if (!isLoaded) {
        this.failedImgLoadList.push(image?.img.src as string);
      }

      // if all fail to load
      if (this.failedImgLoadList.length === this.paginationSize) {
        this._toast.showErrorMessage(ToastMessages.PRODUCT_FAILED_TO_LOAD_PAGINATION);
        this.enableInfiniteScroll = false;
      }
    });

  }

  // get image orientation (includes square)
  getImageOrientation(product: ProductMapper): 'square' | 'portrait' | 'landscape' {
    const resolution = product.metadata['resolution'] as any;
    const width = Number(resolution.split('x')[0]);
    const height = Number(resolution.split('x')[1]);

    if (width === height) {
      return 'square';
    }

    if (width > height) {
      return 'landscape';
    }

    return 'portrait';
  }

  // on input (filter) change
  ngOnChanges(changes: SimpleChanges): void {
    // skip trigger on load
    if (changes['filters'].previousValue) {
      // TODO: prevent call on another filter if there are no items already
      this.showSpinner = true;
      this._firebaseService.isProductListFetching$.next(true);
      this.resetInfiniteScrollFlags();
      this.productList = [];
      this.resetGrid();
      this._firebaseService.getProductsPaginated(this.filters, this.paginationSize).pipe(first()).subscribe(products => {
        // for load animation to show longer
        setTimeout(() => this.handleProductsResponse(products), 600);
      })
    }
  }

  // reset flags that affect infinite scroll;
  resetInfiniteScrollFlags() {
    this._firebaseService.resetPagination();
    this.allProductsLoaded = false;
    this.showFilterNoResults = false;
    this.paginationLoadedTimes = 0;
  }

  // handle products fetch
  handleProductsResponse(products: ProductResponse[]) {
    if (products.length === 0) {
      this.showSpinner = false;
      this.showFilterNoResults = true;
      this._firebaseService.isProductListFetching$.next(false);
      return;
    }

    if (products.length < this.paginationSize) {
      this.allProductsLoaded = true;
    }

    this.productList = products.map(product => ProductMapper.getInstance(product, this.config, this.user));

    // NOTE: both use cases of this fn handler will have empty grid already, on load and on filter (that is why false)
    this.handleImagesLoaded(false);
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

        const mapped = products.map(product => ProductMapper.getInstance(product, this.config, this.user));

        this.productList.push(...mapped);
        this.showPaginationLoadingSpinner = false;
        this.paginationLoadedTimes += 1;

        this.handleImagesLoaded(true);
      }, 500);
    })
  }

  // programaticaly create .grid-item and ProductItem component, add elements to the DOM
  getGridItem(product: ProductMapper, index: number): any {
    // Create grid-item div
    const gridItem = this._renderer.createElement('div');
    this._renderer.addClass(gridItem, 'grid-item');
    this._renderer.addClass(gridItem, this.getImageOrientation(product))

    // Set the stagger as a style property
    const stagger = index % this.paginationSize;
    this._renderer.setStyle(gridItem, '--data-stagger', stagger.toString(), 2);

    this._renderer.appendChild(this.grid.nativeElement, gridItem);

    // Create product item component
    const productComponentRef = this._viewContainerRef.createComponent(ProductItemComponent);
    productComponentRef.instance.product = product;
    productComponentRef.instance.actions = this.config.product.actions;

    this._renderer.appendChild(gridItem, productComponentRef.location.nativeElement);

    return gridItem;
  }


   // create grid
   // append elements or create new instance
   createGrid(append: boolean): void {
     if (append) {
        // prevent append from running on already appended items
        const startIndex = this.paginationLoadedTimes * this.paginationSize;
        this.packery.appended(this.productList.slice(startIndex).map((item, i) => this.getGridItem(item, i)));
        setTimeout(() => this.showGridItems(), 400);
        return;
     }

     this.packery = new Packery(this.grid.nativeElement, {
       itemSelector: '.grid-item',
       // css animation
       transitionDuration: 0
     });

     this.packery.appended(this.productList.map((item, i) => this.getGridItem(item, i)));
     setTimeout(() => this.showGridItems(), 400);
   }

   // show animation
   showGridItems(): void {
    // prevent show animation from running on already shown items
    const startIndex = this.paginationLoadedTimes * this.paginationSize;

    this.packery.items.slice(startIndex).forEach((item: any) => {
      const element: HTMLElement = item.element;
      // const productItem = element.children[0].children[0];
      element.classList.add('show');
    });
   }

  // reset grid
  resetGrid(): void {
    if (this.packery) {
      this.packery.destroy();
      this.packery = null;
    }

    // TODO: recheck this for remove elements from dom
    this.grid.nativeElement.innerHTML = '';
  }

  // fix broken layout after zoom-in/out on other page then coming back
  public fixMasonryLayout() {
    const currentZoomLevel = this._utilService.getZoomLevel();
    if (this.prevZoomLevel !== currentZoomLevel) {
      this.packery.layout();
    }
  }

  ngOnDestroy() {
    this.userStateSub$ && this.userStateSub$.unsubscribe();
    this._firebaseService.resetPagination();
  }

}
