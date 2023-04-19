import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { Subscription } from 'rxjs';

import { 
  ShoppingCart,
  Product,
  CustomUser,
  ToastConstants
} from '@app/models';

import {
  AuthService, 
  FirebaseService, 
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

  // is loaded from another route
  isLoadedFromAnotherRoute = false;

  // custom user state
  customUserState$: Subscription;
  
  constructor(
    private _authService: AuthService,
    private _toast: ToastService,
    private _router: Router,
    private _utilService: UtilService,
    private _firebaseService: FirebaseService
  ) {
    // TODO: in this case user will be here or route is blocked (block route)
    const isLoadedFromAnotherRoute = Boolean(this._router.getCurrentNavigation()?.previousNavigation);
    if (isLoadedFromAnotherRoute) {
      // this is just to avoid spinner when coming from another route
      const user = this._authService.getUser() as CustomUser;
      this.cart = user.cart;
      this.customUserState$ = this._authService.userState$.subscribe(user => this.cart = user!.cart)
      return;
    }
    // if on load/refresh
    this.customUserState$ = this._authService.userState$.subscribe(user => this.cart = user!.cart)
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
      // TODO: move updateUser to firebaseService
      await this._authService.updateUser();
      this._toast.open(ToastConstants.MESSAGES.REMOVED_FROM_CART, ToastConstants.TYPE.SUCCESS.type);
    })
    .catch(err => this._utilService.showDefaultErrorToast())
    .finally(() => setTimeout(() => item.spinners.deleteSpinner = false, 1200));
  }

  // TODO: pagination and delete item not working live, only after refresh

  ngOnInit() {
    //
  }

  ngOnDestroy() {
    this.customUserState$ && this.customUserState$.unsubscribe();
  }

  // TODO: add hover class on delete process and also spinner


}
