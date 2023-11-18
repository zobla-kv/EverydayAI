import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { Subscription, catchError, debounceTime, finalize, first } from 'rxjs';

import {
  ToastConstants,
  CustomUser,
  ProductMapper,
  ProductTypePrint,
  ProductListConfig,
  ProductType,
  ProductResponse,
  ShoppingCart
} from '@app/models';

import {
  AuthService,
  FirebaseService,
  HttpService,
  PaymentService,
  ProductService,
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

  // products in cart
  private _cart: ShoppingCart;
  // sets cart, cart items spinners and paginated cart
  // called on each user update (remove from cart etc.)
  set cart(cart: ShoppingCart) {
    this._cart = cart;

    this.fullProductList = cart.items.map((item: any) => new ProductMapper<ProductTypePrint>(item, ProductListConfig.SHOPPING_CART, this.user))

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

  // fetch spinner
  showLoadSpinner = true;

  // show submit button spinner
  showSubmitButtonSpinner = false;

  // is remove disabled
  // this is to prevent multiple deletes in short time. To be improved with debounce
  isRemoveDisabled = false;

  // this exists to prevent new fetch when item is removed from cart
  // instead of fetch just remove item from cart
  // TODO: instead of keeping something like this in every component, move it to product service and sub to that
  removedItemId: string | null = null;

  constructor(
    private _authService: AuthService,
    private _toast: ToastService,
    private _firebaseService: FirebaseService,
    private _paymentService: PaymentService,
    private _httpService: HttpService,
    private _productService: ProductService,
    public   utilService: UtilService
  ) {

    this.customUserState$ = this._authService.userState$.subscribe(user => {
      this.user = <CustomUser>user;

      if (this.removedItemId) {
        const filteredCartItems = this.cart.items.filter(item => item.id !== this.removedItemId);
        const newTotalSum = this.utilService.getTotalSum(filteredCartItems);
        this.cart = { items: filteredCartItems, totalSum: newTotalSum }
        this.removedItemId = null;
        return;
      }

      this._httpService.getProducts(ProductType.ALL, this.user, this.user.cart).pipe(first()).subscribe(products => {
        this.cart = { items: products, totalSum: this.utilService.getTotalSum(products) };
        this.showLoadSpinner = false;
      })
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
        Validators.pattern('^[a-zA-Z_]+( [a-zA-Z_]+)*$')
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
  async removeFromCart(item: ProductMapper<ProductTypePrint>) {
    if (this.isRemoveDisabled) {
      return;
    }
    this.isRemoveDisabled = true;
    this._productService.removeFromCart(item)
    .then(async () => {
      this.removedItemId = item.id;
      setTimeout(() => this.isRemoveDisabled = false, 1000);
    })
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

  // keep order of keyvalue pipe (not DRY)
  keepOrder() { return 0; }

  ngOnDestroy() {
    this.customUserState$ && this.customUserState$.unsubscribe();
  }

}
