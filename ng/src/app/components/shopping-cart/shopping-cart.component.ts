import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { Subscription } from 'rxjs';

import { 
  ShoppingCart,
  ToastConstants,
  CustomUser,
  ProductResponse,
  ProductMapper,
  ProductTypePrint,
  ProductListConfig
} from '@app/models';

import {
  AuthService, 
  FirebaseService, 
  PaymentService, 
  ToastService, 
  UtilService
} from '@app/services';

@Component({
  selector: 'app-shopping-cart',
  templateUrl: './shopping-cart.component.html',
  styleUrls: ['./shopping-cart.component.scss']
})
export class ShoppingCartComponent implements OnInit, OnDestroy {

  @ViewChild('paginator') paginator: MatPaginator;

  // config 
  config = ProductListConfig.SHOPPING_CART;

  // TODO: bug: flick when adding item to cart on product page

  // products in cart 
  private _cart: ShoppingCart;
  // sets cart, cart items spinners and paginated cart
  // called on each user update (remove from cart etc.)
  set cart(cart: ShoppingCart) {
    this._cart = cart;
    this.fullProductList = this._cart.items.map((item: any) => new ProductMapper<ProductTypePrint>(item, ProductListConfig.SHOPPING_CART, this.user))

    // initial
    if (!this.paginator) {
      this.paginatedCart = this.utilService.getFromRange(this.fullProductList, 0, this.config.pageSize - 1);
      return;
    }

    // afterwards
    this.paginatedCart = this.getProductsForNextPage();

    // after removing if no more items are left on the page
    // when dividible by pageSize (4) after item remove
    // go page back
    const modus = this.paginatedCart.length % this.config.pageSize;
    if (modus === 0) {
      this.paginator.previousPage();
    }
  }

  get cart(): ShoppingCart {
    return this._cart;
  }

  // on set map all list to use screen not small
  fullProductList: ProductMapper<ProductTypePrint>[] = [];

  // only holds current page items
  paginatedCart: ProductMapper<ProductTypePrint>[] = [];

  // custom user
  user: CustomUser;

  // custom user state
  customUserState$: Subscription;

  // screen size
  screenSize: string;

  // screen size sub
  screenSize$: Subscription;

  // payment form
  paymentForm: FormGroup;

  // show submit button spinner
  showSubmitButtonSpinner = false;

  constructor(
    private _authService: AuthService,
    private _toast: ToastService,
    private _firebaseService: FirebaseService,
    private _paymentService: PaymentService,
    public utilService: UtilService,
  ) {
    this.customUserState$ = this._authService.userState$.subscribe(user => {
      // NOTE: auth guard
      this.user = <CustomUser>user;
      this.cart = (<CustomUser>user).cart;
    });

    this.screenSize$ = this.utilService.screenSizeChange$.subscribe(size => {
      if (size === 'xs') {
        // reset on small screen
        // this.paginatedCart = this.cart.items;
        this.paginator && this.paginator.firstPage();
      }
      this.screenSize = size;
    })
  }

  ngOnInit(): void {

    this.paymentForm = new FormGroup({
      'holder_name': new FormControl(null, [
        Validators.required, 
        Validators.maxLength(24), 
        Validators.pattern('^[a-zA-Z]*$')
      ]),
      'number': new FormControl(null, [
        Validators.required, 
        Validators.maxLength(20),
        Validators.pattern('^[0-9-]*$')
      ]),
      'expiration_date': new FormControl(null, [
        Validators.required, 
        Validators.maxLength(7),
        Validators.pattern('^[0-9/]*$')
      ]),
      'cvc': new FormControl(null, [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(5),
        Validators.pattern('^[0-9]*$')
      ])
    })
  }

  // used to return current cart to template
  // if 'xs' screen show whole cart else show paginated cart
  getCurrentCart(): ProductMapper<ProductTypePrint>[] {
    if (this.screenSize !== 'xs') {
      return this.paginatedCart;
    }
    return this.fullProductList;
  }

  // change page
  changePage(): void {
    this.paginatedCart = this.getProductsForNextPage();
  }

  // get products for next paginated list
  getProductsForNextPage(): ProductMapper<ProductTypePrint>[] {
    return this.utilService.getFromRange(
      this.fullProductList,
      this.paginator.pageIndex * this.config.pageSize,
      (this.paginator.pageIndex + 1) * this.config.pageSize - 1
    );
  }

  // remove item from cart
  removeFromCart(ev: Event, id: number) {
    const itemIndex = this.cart.items.findIndex(item => item.id === id)!;
    const item = this.cart.items[itemIndex] as ProductMapper<ProductTypePrint>;
    item.spinners['delete'] = true;
    this._firebaseService.removeProductFromCart(ProductMapper.getOriginalObject(item))
    .then(async () => {
      await this._authService.updateUser();
      this._toast.open(ToastConstants.MESSAGES.REMOVED_FROM_CART, ToastConstants.TYPE.SUCCESS.type);
    })
    .catch(err => this._toast.showDefaultError())
    .finally(() => setTimeout(() => item.spinners['delete'] = false, 1200));
  }


  // handles purchase
  async handlePurchase() {
    this.validateAllFormFields(this.paymentForm);
    if (this.paymentForm.valid) {
      this.showSubmitButtonSpinner = true;
      await this._paymentService.processPayment(this.user, this.paymentForm.getRawValue());
      this.showSubmitButtonSpinner = false;
    } else {
      this.validateAllFormFields(this.paymentForm);
    }
  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  ngOnDestroy() {
    this.customUserState$ && this.customUserState$.unsubscribe();
  }

}
