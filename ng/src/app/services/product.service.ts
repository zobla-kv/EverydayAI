import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, Subscription, forkJoin, from, of } from 'rxjs';

import environment from '@app/environment';

import {
  CustomUser,
  ProductActions,
  ProductMapper,
  ToastMessages
} from '@app/models';

import {
   AuthService,
   FirebaseService,
   ToastService
} from '@app/services';

// product related actions
// NOTE: common handlers for success/failure
@Injectable({
  providedIn: 'root'
})
export class ProductService implements OnDestroy {
  // is logged in
  user: CustomUser | null;

  // user sub
  userStateSub$: Subscription;

  // product details closed event
  productDetailsClosed$ = new Subject<void>();

  constructor(
    private _authService: AuthService,
    private _toast: ToastService,
    private _router: Router,
    private _firebaseService: FirebaseService
  ) {
    this.userStateSub$ = this._authService.userState$.subscribe(user => user && (this.user = user));
  }

  // add product to cart
  async addToCart(product: ProductMapper) {
    product.spinners[ProductActions.CART] = true;
    if (!this.user) {
      this._router.navigate(['auth', 'login']);
      product.spinners[ProductActions.CART] = false;
      return;
    }
    this._firebaseService.addProductToCart(product.id)
    .then(async () => await this._handleCartActionSucceeded(product))
    .catch(err => this._handleCartActionFailed(product))
  }

  // remove product from cart
  async removeFromCart(product: ProductMapper): Promise<void> {
    product.spinners[ProductActions.CART] = true;
    this._firebaseService.removeProductFromCart(product.id)
    .then(async () => await this._handleCartActionSucceeded(product))
    .catch(err => this._handleCartActionFailed(product))
  }

  // after product was added/removed to cart
  private async _handleCartActionSucceeded(product: ProductMapper) {
    // this can trigger catch block, for that 'await' is needed
    await this._authService.updateUser();
    product.isInCart = !product.isInCart;
    if (product.isInCart) {
      this._toast.showSuccessMessage(ToastMessages.CART_PRODUCT_ADDED);
    } else {
      this._toast.showSuccessMessage(ToastMessages.CART_PRODUCT_REMOVED);
    }
    product.spinners[ProductActions.CART] = false;
  }

  private _handleCartActionFailed(product: ProductMapper) {
    product.spinners[ProductActions.CART] = false;
    this._toast.showDefaultError();
  }

  // download product
  async download(product: ProductMapper) {
    // download is somewhere triggered from cart action (tab shop), somewhere from download action (tab owned)
    product.spinners[ProductActions.CART] = true;
    product.spinners[ProductActions.DOWNLOAD] = true;

    const downloadUrl = `${environment.API_HOST}/api/products/download/${product.id}?&uid=${this.user ? this.user.id : null}`;

    try {
      // test url before download (not the greatest way because call is triggered twice) - careful with handler on BE
      const isWorking = (await fetch(downloadUrl)).ok;

      if (!isWorking) {
        throw new Error();
      }

      const a = document.createElement('a');
      a.href = downloadUrl;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // NOTE: errors are not caught and will not disrupt download, catch does not catch err in those
      forkJoin([
        from(this._firebaseService.addProductLike(product.id, this.user)),
        (this.user && !this.user.ownedItems.includes(product.id)) ? this._firebaseService.addProductToUser(product.id, this.user) : of(false)
      ])
      .subscribe(([undefined, userUpdated]) => {
        if (userUpdated) {
          this._toast.showSuccessMessage(ToastMessages.PRODUCT_ADDED_TO_OWNED_ITEMS, { duration: 6000 });
          this._authService.updateUser();
        }
      });

    }

    catch (err) {
      this._toast.showErrorMessage(ToastMessages.PRODUCT_DOWNLOAD_FAILED, { duration: 3000 });
    }

    finally {
      product.spinners[ProductActions.CART] = false;
      product.spinners[ProductActions.DOWNLOAD] = false;
    }

  }

  ngOnDestroy(): void {
    this.userStateSub$ && this.userStateSub$.unsubscribe();
  }
}


/* OLD WAY - saved for ref */

// // FE download (the old way)
// private _triggerDownloadOld(product: ProductMapper, url: string): void {
//   // if logged in and item not owned, add to owned and remove from cart if it is there
//   if (this.user && !this.user.ownedItems.includes(product.id)) {
//     this._firebaseService.addProductToUser(product.id, this.user)
//     .subscribe(res => {
//       this._toast.open(ToastConstants.MESSAGES.PRODUCT_ADDED_TO_OWNED_ITEMS, ToastConstants.TYPE.SUCCESS.type, { duration: 4000 });
//       this._authService.updateUser();
//     });
//   }

//   const fileName = product.title + '.' + this._utilService.getFileExtension(product.fileName);
//   const a = document.createElement('a');
//   a.href = url;
//   a.download = fileName;
//   document.body.appendChild(a);
//   a.click();
//   document.body.removeChild(a);
//   // NOTE: capturing download finished event required BE download
//   // so block download for 1.5 seconds to avoid downloading multiple times
//   setTimeout(() => {
//     product.spinners[ProductActions.CART] = false;
//     product.spinners[ProductActions.DOWNLOAD] = false;
//   }, 1500);
// }

