import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription, first } from 'rxjs';

import {
  CustomUser,
  ProductActions,
  ProductMapper,
  ProductResponse,
  ProductTypePrint,
  ToastConstants
} from '@app/models';

import {
   AuthService,
   FirebaseService,
   HttpService,
   ToastService,
   UtilService
} from '@app/services';

// product related actions
// NOTE: common handlers for success/failure
@Injectable({
  providedIn: 'root'
})
export class ProductService implements OnDestroy {

  // TODO: merge product-like service with this.

  // is logged in
  user: CustomUser | null;

  // user sub
  userStateSub$: Subscription;

  constructor(
    private _authService: AuthService,
    private _toast: ToastService,
    private _router: Router,
    private _httpService: HttpService,
    private _utilService: UtilService,
    private _firebaseService: FirebaseService
  ) {
    this.userStateSub$ = this._authService.userState$.subscribe(user => user && (this.user = user));
   }

  // add product to cart
  async addToCart(product: ProductMapper<ProductTypePrint>) {
   product.spinners[ProductActions.CART] = true;
   if (!this.user) {
     this._router.navigate(['auth', 'login']);
     return;
   }
   this._firebaseService.addProductToCart(
     ProductMapper.getOriginalObject(product),
     this.user.cart.totalSum
   )
   .then(async () => await this._handleCartActionSucceeded(product))
   .catch(err => this._handleCartActionFailed(product))
  }

  // remove product from cart
  async removeFromCart(product: ProductMapper<ProductTypePrint>) {
    product.spinners[ProductActions.CART] = true;
    this._firebaseService.removeProductFromCart(
      ProductMapper.getOriginalObject(product),
      (<CustomUser>this.user).cart.totalSum
    )
    .then(async () => await this._handleCartActionSucceeded(product))
    .catch(err => this._handleCartActionFailed(product))
  }

   // after product was added/removed to cart
  private async _handleCartActionSucceeded(product: ProductMapper<ProductTypePrint>) {
    // this can trigger catch block, for that 'await' is needed
    await this._authService.updateUser();
    product.isInCart = !product.isInCart;
    if (product.isInCart) {
      this._toast.open(ToastConstants.MESSAGES.ADDED_TO_CART, ToastConstants.TYPE.SUCCESS.type);
    } else {
      this._toast.open(ToastConstants.MESSAGES.REMOVED_FROM_CART, ToastConstants.TYPE.SUCCESS.type);
    }
    product.spinners[ProductActions.CART] = false;
  }

  private _handleCartActionFailed(product: ProductMapper<ProductTypePrint>) {
    product.spinners[ProductActions.CART] = false;
    this._toast.showDefaultError();
  }

   // download product
   async download(product: ProductResponse) {
    if (!this.user) {
      this._router.navigate(['auth', 'login']);
      return;
    }

    if (!product.imgPath.includes('assets')) {
      // for non 404 images
      this._triggerDownload(product, product.imgPath);
      return;
    }

    this._httpService.getProductImage(product.fileName)
    .pipe(first())
    .subscribe(path => {
      if (!path) {
        this._toast.showDefaultError();
        return;
      } else {
        this._triggerDownload(product, path);
      }
    })
   }

   // trigger download action
   private _triggerDownload(product: ProductResponse, url: string): void {
    const fileName = product.title + '.' + this._utilService.getFileExtension(product.fileName);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  ngOnDestroy(): void {
    console.log('destoyed service')
    this.userStateSub$.unsubscribe();
  }
}
