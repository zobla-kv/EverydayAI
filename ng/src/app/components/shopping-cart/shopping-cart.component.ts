import { Component, OnDestroy, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { Subscription,first } from 'rxjs';
import environment from '@app/environment';

declare const paypal: any;

import {
  CustomUser,
  ProductMapper,
  ProductListConfig,
  ProductType,
  ShoppingCart,
  ToastMessages,
  EmailType
} from '@app/models';

import {
  AuthService,
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
export class ShoppingCartComponent implements OnDestroy {

  @ViewChild('paginator') paginator: MatPaginator;

  // config
  config = ProductListConfig.SHOPPING_CART;

  // products in cart
  private _cart: ShoppingCart;
  // sets cart, cart items spinners and paginated cart
  // called on each user update (remove from cart etc.)
  set cart(cart: ShoppingCart) {
    this._cart = cart;

    if (cart.items.length === 0) {
      this.showPaymentButtons = false;
    }

    this.fullProductList = cart.items.map(item => ProductMapper.getInstance(item, this.config, this.user));

    // initial
    if (!this.paginator) {
      this.paginatedCart = this.utilService.getFromRange(this.fullProductList, 0, this.pageSize - 1);
      return;
    }

    // afterwards
    this.paginatedCart = this.getProductsForNextPage();

    // after removing if no more items are left on the page
    // when dividible by pageSize (4) after item remove
    // go page back
    const modus = this.paginatedCart.length % this.pageSize;
    if (modus === 0) {
      this.paginator.previousPage();
    }
  }

  get cart(): ShoppingCart {
    return this._cart;
  }

  // on set map all list to use screen not small
  fullProductList: ProductMapper[] = [];

  // only holds current page items
  paginatedCart: ProductMapper[] = [];

  // number of items per page
  pageSize = 4;

  // custom user
  user: CustomUser;

  // custom user state
  userStateSub$: Subscription;

  // screen size
  screenSize: string;

  // screen size sub
  screenSize$: Subscription;

  // fetch spinner
  showLoadSpinner = true;

  // show payment buttons?
  showPaymentButtons = false;

  // are payment buttons rendered?
  paymentButtonsRendered = false;

  // is remove disabled
  // this is to prevent multiple deletes in short time. To be improved with debounce
  isRemoveDisabled = false;

  // this exists to prevent new fetch when item is removed from cart
  // instead of fetch just remove item from cart
  // TODO: instead of keeping something like this in every component, move it to product service and sub to that
  removedItemId: string | null = null;

  constructor(
    private _authService: AuthService,
    private _paymentService: PaymentService,
    private _httpService: HttpService,
    private _productService: ProductService,
    public   utilService: UtilService,
    private _toast: ToastService
  ) {

    this.loadPaypalScript();

    this.userStateSub$ = this._authService.userState$.subscribe(user => {
      this.user = <CustomUser>user;

      if (this.removedItemId) {
        this.updateCartOnClient();
      } else {
        // TODO: running on each user update because of reuse strategy. More fetches than needed.
        // idea: store updated cart somwehere and on route reopen fetch difference between current and updated cart.
        this.updateCartFromServer();
      }

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

  // loads paypal script
  async loadPaypalScript(): Promise<void> {
    const paypalSdkUrl = 'https://www.paypal.com/sdk/js';
    const clientId = environment.paypal_client_id;
    const components = 'buttons' // card-fields not supported in Serbia

    this.utilService.loadScript(
      paypalSdkUrl + '?client-id=' + clientId + '&components=' + components + '&enable-funding=venmo'
    )
    .catch(err => this._toast.showErrorMessage(ToastMessages.PAYMENT_SCRIPT_FAILED_TO_LOAD));
  }


  // renders paypal buttons
  renderPaypalButtons() {
    paypal.Buttons({
      style: {
        layout: 'vertical',
        color:  'gold',
        shape:  'rect',
        label:  'paypal'
      },
      createOrder: (data: any, actions: any) => this._paymentService.createOrder(this.user.id, this.user.cart),
      onApprove: (data: any, actions: any) => {
        this._paymentService.handlePaymentApprove(this.user.id, data.orderID, this.user.cart)
        .then(() => {
          this._authService.updateUser();
          this._toast.showSuccessMessage(ToastMessages.PAYMENT_SUCCESSFUL);
        })
        .catch(err => this._toast.showErrorMessage(ToastMessages.PAYMENT_FAILED_TO_PROCESS_PAYMENT));
      },
      onCancel: () => this._toast.showErrorMessage(ToastMessages.PAYMENT_PAYMENT_TERMINATED),
      // onError: (err: any) => this._toast.showErrorMessage(ToastMessages.PAYMENT_FAILED_TO_INITIALIZE_PAYMENT)
      onError: (err: any) => this._toast.showErrorMessage(err)
    })
    .render('#paypalButtonsContainer');
  }

  // render buttons again because they dissapear on route leave
  onAttach() {
    if (this.cart.items.length > 0) {
      this.showPaymentButtons = true;
      this.renderPaypalButtons();
    }
  }

  // update cart on client side
  updateCartOnClient() {
    const filteredCartItems = this.cart.items.filter(item => item.id !== this.removedItemId);
    const newTotalSum = this.utilService.getTotalSum(filteredCartItems);
    this.cart = { items: filteredCartItems, totalSum: newTotalSum }
    this.removedItemId = null;
  }

  // update cart on server side
  updateCartFromServer() {
    this._httpService.getProducts(ProductType.ALL, this.user, this.user.cart).pipe(first()).subscribe(products => {
      this.cart = { items: products, totalSum: this.utilService.getTotalSum(products) };

      if (!this.paymentButtonsRendered) {
        this.updateUIAfterCartUpdate();
      }

    });
  }

  // update UI after cart update
  updateUIAfterCartUpdate() {
    setTimeout(() => {
      this.showPaymentButtons = this.cart.items.length > 0;
      this.showLoadSpinner = false;
      this.renderPaypalButtons();
      this.paymentButtonsRendered = true;
    }, 1300);
  }

  // used to return current cart to template
  // if 'xs' screen show whole cart else show paginated cart
    getCurrentCart(): ProductMapper[] {
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
  getProductsForNextPage(): ProductMapper[] {
    return this.utilService.getFromRange(
      this.fullProductList,
      this.paginator.pageIndex * this.pageSize,
      (this.paginator.pageIndex + 1) * this.pageSize - 1
    );
  }

  // remove item from cart
  async removeFromCart(item: ProductMapper) {
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

  // keep order of keyvalue pipe (not DRY)
  keepOrder() { return 0; }

  ngOnDestroy() {
    this.userStateSub$ && this.userStateSub$.unsubscribe();
  }

}
