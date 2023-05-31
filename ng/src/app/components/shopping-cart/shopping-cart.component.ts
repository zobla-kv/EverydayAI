import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { Subscription } from 'rxjs';

import { 
  ShoppingCart,
  Product,
  ToastConstants,
  CustomUser
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

  // num of items per page
  pageSize = 4;

  // products in cart
  private _cart: ShoppingCart;

  // only holds current page items
  paginatedCart: Product[];

  // custom user state
  customUserState$: Subscription;

  // stripe popup window
  private stripeWindow: any;
  
  constructor(
    private _authService: AuthService,
    private _toast: ToastService,
    private _utilService: UtilService,
    private _firebaseService: FirebaseService,
    private _paymentService: PaymentService
  ) {
    this.customUserState$ = this._authService.userState$.subscribe(user => this.cart = (<CustomUser>user).cart);
  }

  ngOnInit(): void {
    this.initializeStripe();
  }

  initializeStripe() {
    // const script = document.createElement('script');
    // script.id = 'stripe-script';
    // script.type = 'text/javascript';
    // script.src = 'https://js.stripe.com/v3/';
    // script.onload = () => {
    //   this.stripeWindow = StripeCheckout.configure({

    //   })
    // }
  }

  // sets cart, cart items spinners and paginated cart
  // called on each user update (remove from cart etc.)
  set cart(cart: ShoppingCart) {
    this._cart = cart;
    this._cart.items = this.addFrontendProperties();

    // initial
    if (!this.paginator) {
      this.paginatedCart = this._utilService.getFromRange(this._cart.items, 0, this.pageSize - 1);
      return;
    }
    // afterwards
    this.paginatedCart = this._utilService.getFromRange(
      this._cart.items,
      this.paginator.pageIndex * this.pageSize,
      (this.paginator.pageIndex + 1) * this.pageSize - 1
    );

    // after removing if no more items are left on the page
    // when dividible by pageSize (4) after item remove
    // go page back
    const modus = this._cart.items.length % this.pageSize;
    if (modus === 0) {
      this.paginator.previousPage();
    }
  }

  get cart(): ShoppingCart {
    return this._cart;
  }

  // add delete spinner
  addFrontendProperties(): Product[] {
    return this._cart.items.map(item => {
      return { ...item, spinners: { deleteSpinner: false } }
    })
  }

  // remove front end properties added by reverse method
  // get original object to store in db
  removeFrontendProperties(item: Product): Product {
    const itemCopy = this._utilService.getDeepCopy(item);
    delete itemCopy.spinners;
    return itemCopy;
  }

  // change page
  changePage() {
    this.paginatedCart = this._utilService.getFromRange(
      this.cart.items,
      this.paginator.pageIndex * this.pageSize,
      (this.paginator.pageIndex + 1) * this.pageSize - 1
    );
  }

  // remove item from cart
  removeFromCart(ev: Event, id: number) {
    const itemIndex = this.cart.items.findIndex(item => item.id === id)!;
    const item = this.cart.items[itemIndex];
    item.spinners.deleteSpinner = true;
    this._firebaseService.removeProductFromCart(this.removeFrontendProperties(item))
    .then(async () => {
      await this._authService.updateUser();
      this._toast.open(ToastConstants.MESSAGES.REMOVED_FROM_CART, ToastConstants.TYPE.SUCCESS.type);
    })
    .catch(err => this._toast.showDefaultError())
    .finally(() => setTimeout(() => item.spinners.deleteSpinner = false, 1200));
  }


  // handles checkout
  handleCheckout() {
    // this.stripeWindow = StripeCheckout.configure({
    //   key: 'pk_test_51Mye5nBLAjQvm5Arxe8N9A3t7En16y8WyLL4JksjP2C9L875dR8AYKZ7B4EkkEP82UYEEEdKsEMPlZA4INMhvjFz00m9C2NGGF',
    //   image: 'https://res.cloudinary.com/denyksoss/image/upload/v1680162655/house%20of%20dogs/mock-image_rqblt6.jpg',
    //   locale: 'auto',
    //   token: (token: any) => {
    //     this._paymentService.processPayment(token, 500 * 100/* random-amount * -> 500 = 5$ */);
    //   }
    // })

    this._paymentService.processPayment();
  }

  ngOnDestroy() {
    this.customUserState$ && this.customUserState$.unsubscribe();
  }

  // TODO: Important! pagination and delete item not working live, only after refresh
  // TODO: add hover class on delete process and also spinner


}
