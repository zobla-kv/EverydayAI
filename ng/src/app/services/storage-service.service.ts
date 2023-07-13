import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';

import { 
  AppConstants
} from '@app/models';

import {
  AuthService
} from '@app/services';


/**
 * Service for interacting with local/session storages.
 * used for persisting state on refresh. (avoid flickering)
 *
 */
@Injectable({
  providedIn: 'root'
})
export class StorageService {

  // subscibe to user state (change to number of cart items etc.)
  customUserState$: Subscription;

  constructor(
    private _authService: AuthService
  ) { 
    this.customUserState$ = this._authService.userState$
    .subscribe(user => {
      if (user) {
        this.setUserToLocalStorage()
        this.setNumberOfItemsInCart(user.cart.items.length);
      } else {
        this.removeUserFromLocalStorage();
        this.removeCartFromLocalStorage();
      }
    })
  }

  // save mock user to session storage (should exist only if user is logged in)
  setUserToLocalStorage(): void {
    if (!localStorage.getItem(AppConstants.STORAGE_USER_KEY)) {
      localStorage.setItem(AppConstants.STORAGE_USER_KEY, AppConstants.STORAGE_USER_VALUE);
    }
  }
  
  // for immediately returning user logged in state (avoid flickering)
  getUserFromLocalStorage(): string | null {
    return localStorage.getItem(AppConstants.STORAGE_USER_KEY);
  }

  // remove mock user from session storage
  removeUserFromLocalStorage(): void {
    if (localStorage.getItem(AppConstants.STORAGE_USER_KEY)) {
      localStorage.removeItem(AppConstants.STORAGE_USER_KEY);
    }
  }

  // save number of items in cart
  setNumberOfItemsInCart(number: number): void {
    localStorage.setItem(AppConstants.STORAGE_NUM_OF_ITEMS_IN_CART_KEY, `${number}`);
  }

  // save number of items in cart
  getNumberOfItemsInCart(): number {
    const numOfItems: any = localStorage.getItem(AppConstants.STORAGE_NUM_OF_ITEMS_IN_CART_KEY);
    return numOfItems ? numOfItems : 0;
  }

  // remove cart from local storage
  removeCartFromLocalStorage(): void {
    if (localStorage.getItem(AppConstants.STORAGE_NUM_OF_ITEMS_IN_CART_KEY)) {
      localStorage.removeItem(AppConstants.STORAGE_NUM_OF_ITEMS_IN_CART_KEY);
    }
  }

  ngOnDestroy() {
    this.customUserState$ && this.customUserState$.unsubscribe();
  }

}
