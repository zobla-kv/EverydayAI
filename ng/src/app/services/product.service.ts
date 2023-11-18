import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, Subscription, first } from 'rxjs';

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
    this._firebaseService.addProductToCart(product.id)
    .then(async () => await this._handleCartActionSucceeded(product))
    .catch(err => this._handleCartActionFailed(product))
  }

  // remove product from cart
  async removeFromCart(product: ProductMapper<ProductTypePrint>): Promise<void> {
    product.spinners[ProductActions.CART] = true;
    this._firebaseService.removeProductFromCart(product.id)
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
  async download(product: ProductMapper<ProductTypePrint>) {
    // download is somewhere triggered from cart action (tab shop), somewhere from download action (tab owned)
    product.spinners[ProductActions.CART] = true;
    product.spinners[ProductActions.DOWNLOAD] = true;

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
  private _triggerDownload(product: ProductMapper<ProductTypePrint>, url: string): void {
    // if logged in and item not owned, add to owned and remove from cart if it is there
    if (this.user && !this.user.ownedItems.includes(product.id)) {
      this._firebaseService.addProductToUser(product.id, this.user)
      .subscribe(res => {
        this._toast.open(ToastConstants.MESSAGES.PRODUCT_ADDED_TO_OWNED_ITEMS, ToastConstants.TYPE.SUCCESS.type, { duration: 4000 });
        this._authService.updateUser();
      })
    }

    const fileName = product.title + '.' + this._utilService.getFileExtension(product.fileName);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    // TODO: capturing download finished event seems complex at this point
    // so block download for 1.5 seconds to avoid downloading multiple times
    setTimeout(() => {
      product.spinners[ProductActions.CART] = false;
      product.spinners[ProductActions.DOWNLOAD] = false;
    }, 1500);
  }

  ngOnDestroy(): void {
    this.userStateSub$ && this.userStateSub$.unsubscribe();
  }
}
