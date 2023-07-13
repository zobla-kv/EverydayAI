import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { Subscription, first } from 'rxjs';

import {
  AuthService, 
  FirebaseService, 
  HttpService, 
  ToastService
} from '@app/services';

import { 
  CustomUser,
  ToastConstants,
  ProductActions,
  ProductMapper,
  ProductTypePrint
} from '@app/models';


@Component({
  selector: 'app-product-item',
  templateUrl: './product-item.component.html',
  styleUrls: ['./product-item.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProductItemComponent implements OnInit, OnDestroy {

  // use in template
  readonly productActions = ProductActions;

  // product
  @Input('product') product: ProductMapper<ProductTypePrint>;

  // actions a product can peform
  @Input('actions') actions: string[];

  // product img loaded event
  @Output() imgLoaded = new EventEmitter<void>();

  // current user
  user: CustomUser | null;

  // user sub
  userStateSub$: Subscription;

  constructor(
    private _authService: AuthService,
    private _firebaseService: FirebaseService,
    private _toast: ToastService,
    private _router: Router,
    private _httpService: HttpService
  ) {
  }

  ngOnInit() {
    this.userStateSub$ = this._authService.userState$.subscribe(user => user && (this.user = user));
  }

  // emit event once img is loaded
  handleImageLoaded() {
    this.imgLoaded.emit();
  }

  // used to keep order in keyvalue pipe (it sorts by default)
  keepOrder() { return 0; }

  // handles add to cart
  addToCart() {
    if (!this.user) {
      this._router.navigate(['auth', 'login']);
      return;
    }
    this.product.spinners[ProductActions.CART] = true;
    this._firebaseService.addProductToCart(ProductMapper.getOriginalObject(this.product))
    .then(async () => await this.handleCartActionSucceeded())
    .catch(err => this.handleCartActionFailed())
  }

  // handles remove from cart
  removeFromCart() {
    this.product.spinners[ProductActions.CART] = true;
    this._firebaseService.removeProductFromCart(ProductMapper.getOriginalObject(this.product))
    .then(async () => await this.handleCartActionSucceeded())
    .catch(err => this.handleCartActionFailed())
  }

  // after product was added/removed to cart
  async handleCartActionSucceeded() {
    // this can trigger catch block, for that 'await' is needed
    await this._authService.updateUser();
    this.product.isInCart = !this.product.isInCart;
    if (this.product.isInCart) {
      this._toast.open(ToastConstants.MESSAGES.ADDED_TO_CART, ToastConstants.TYPE.SUCCESS.type);
    } else {
      this._toast.open(ToastConstants.MESSAGES.REMOVED_FROM_CART, ToastConstants.TYPE.SUCCESS.type);
    }
    this.product.spinners[ProductActions.CART] = false;
  }

  // after product failed to be added/removed to cart
  handleCartActionFailed() {
    this.product.spinners[ProductActions.CART] = false;
    this._toast.showDefaultError();
  }

  // handle like
  // TODO: implement
  handleLike() {

  }

  // handle download
  handleDownload() {
    // TODO: allow unlogged to access 'owner items' tab
    // TODO: prevent people from going to site where imgs are stored and downloading all, some private + auth?
    // TODO: error handling
    if (!this.user) {
      this._router.navigate(['auth', 'login']);
      return;
    }
    this._httpService.fetchImageUrlAsBlob(this.product.imgPath)
    .pipe(first())
    .subscribe(blob => {
       if (!blob) {
         this._toast.showDefaultError();
         return;
       }
       const url = URL.createObjectURL(blob);
       // TODO: does this really turn img into .png (.jfif to .png)
       const fileName = this.product.description + '.png';
       const a = document.createElement('a');
       a.href = url;
       a.download = fileName;
       document.body.appendChild(a);
       a.click();
       document.body.removeChild(a);
    });
  }

  ngOnDestroy(): void {
    this.userStateSub$.unsubscribe();
  }

}
