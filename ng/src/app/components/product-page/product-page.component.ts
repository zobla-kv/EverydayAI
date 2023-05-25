import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router} from '@angular/router';
import { AnimationEvent } from '@angular/animations';

import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { map } from 'rxjs/internal/operators/map';
import { Subscription, first } from 'rxjs';

import {
  CustomUser,
  Product,
  ToastConstants
} from '@app/models';

import {
  AuthService,
  FirebaseService,
  ToastService,
  UtilService
} from '@app/services';

import animations from './product-page.animations';

@Component({
  selector: 'app-product-page',
  templateUrl: './product-page.component.html',
  styleUrls: ['./product-page.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations
})
export class ProductPageComponent implements OnInit, OnDestroy {

  @ViewChild('paginator') paginator: MatPaginator;

  // is first visit
  isFirstVisit = this._utilService.isFirstVisit();

  // list containing all products
  fullProductList: Product[];

  // paginated list
  productList: Product[];

  // number of items per page
  pageSize = 6;

  // animate show/hide product items
  productVisibilityState = 'hide';

  // products loading spinner
  showSpinner = false;

  // number of loaded images
  numOfloadedImages = 0;
  
  // current user (always this type because loginGuard)
  user: CustomUser;

  // user sub
  userStateSub$: Subscription;

  constructor(
    private _authService: AuthService,
    private _firebaseService: FirebaseService,
    private _utilService: UtilService,
    private _toast: ToastService,
    private _router: Router
  ) {
  }

  // TODO: error handling
  // TODO: keep data when routing so it wouldn't reach DB every time
  ngOnInit(): void {
    this.showSpinner = true;
    this.userStateSub$ = this._authService.userState$.subscribe(user => {
      if (user) {
        // TODO: use this user to customize html
        // not used now??
        this.user = user;
      }
      this.fetchProducts();
    });
  }

  // fetch products from BE
  fetchProducts(): void {
    this._firebaseService.getProducts()
    .pipe(
      first(),
      // if logged in attach front end properties (action spinners, isInCart etc.)
      map((products: Product[]) => this.user ?
        products.map(product => this.addFrontendProperties(product)) :
        products
      )
    )
    .subscribe(products => {
      console.log('products: ', products);
      this.fullProductList = products as unknown as Product[];
      this.paginator.length = this.fullProductList.length;
      this.updatePageInfo();
    })
  }

  // TODO: runs on each page
  // TODO: maybe add checks (img.complete && img.naturalWidth ~) ?
  // TODO: can also fail, do error handling (endpoint will return url but image is not available)
  handleImageLoaded() {
    if (++this.numOfloadedImages === this.productList.length) {
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
    this.productList = this._utilService.getFromRange(
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

  // add front end properties to Product (spinners, isInCart etc.)
  // only if user is logged in
  addFrontendProperties(product: Product): Product {
    return {
      ...product,
      spinners: {
        showCartActionSpinner: false
      },
      isInCart: this.isInCart(product)
    }
  }

  // remove front end properties added by reverse method
  // get original object to store in db
  removeFrontendProperties(product: Product): Product {
    const productCopy = this._utilService.getDeepCopy(product);
    delete productCopy.spinners;
    delete productCopy.isInCart;
    return productCopy;
  }

  // is product in cart?
  isInCart(product: Product): boolean {
    const cart = this.user?.cart.items as Product[];
    return cart.findIndex(el => el.id === product.id) > -1;
  }

  // handles add to cart
  addToCart(productId: number) {
    // if not logged in
    if (!this.user) {
      this._router.navigate(['auth', 'login']);
      return;
    }
    let targetProduct: any = this.productList.find(product => product.id === productId);
    if (targetProduct) {
      targetProduct.spinners.showCartActionSpinner = true;
      this._firebaseService.addProductToCart(this.removeFrontendProperties(targetProduct))
      .then(async () => await this.handleCartActionSucceeded(targetProduct, 'add'))
      .catch(err => this.handleCartActionFailed(targetProduct))
    } else {
      this.handleCartActionFailed(targetProduct);
    }
  }

  // handles remove from cart
  removeFromCart(productId: number) {
    let targetProduct: any = this.productList.find(product => product.id === productId);
    if (targetProduct) {
      targetProduct.spinners.showCartActionSpinner = true;
      this._firebaseService.removeProductFromCart(this.removeFrontendProperties(targetProduct))
      .then(async () => await this.handleCartActionSucceeded(targetProduct, 'remove'))
      .catch(err => this.handleCartActionFailed(targetProduct))
    } else {
      this.handleCartActionFailed(targetProduct);
    }
  }

  // after product was added/removed to cart
  async handleCartActionSucceeded(product: Product, action: string) {
    // this can trigger catch block, for that 'await' is needed
    await this._authService.updateUser();
    if (action === 'add') {
      product.isInCart = true;
      this._toast.open(ToastConstants.MESSAGES.ADDED_TO_CART, ToastConstants.TYPE.SUCCESS.type);
    }
    if (action === 'remove') {
      product.isInCart = false;
      this._toast.open(ToastConstants.MESSAGES.REMOVED_FROM_CART, ToastConstants.TYPE.SUCCESS.type);
    }
    product.spinners.showCartActionSpinner = false;
  }

  // after product failed to be added/removed to cart
  handleCartActionFailed(product: Product) {
    product.spinners.showCartActionSpinner = false;
    this._toast.showDefaultError();
  }

  ngOnDestroy(): void {
    this.userStateSub$.unsubscribe();
  }

}
