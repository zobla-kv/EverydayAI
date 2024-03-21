import { Injectable } from '@angular/core';

import {
  HttpService
} from '@app/services';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  // how many times succesful payment occured?
  private _paymentOccuredCount = 0;

  constructor(
    private _http: HttpService
  ) {}

  // getter for paymentOccuredCount variable
  get paymentOccuredCount() {
    return this._paymentOccuredCount;
  }

  // update succesful payment count
  updatePaymentCount() {
    this._paymentOccuredCount += 1;
  }

  // creates order
  async createOrder(userId: string, cartItems: string[]): Promise<string> {
    return this._http.createOrder(userId, cartItems);
  }

  // handle payment approve
  async handlePaymentApprove(userId: string, orderId: string, cartItems: string[]): Promise<void> {
    return this._http.captureOrder(userId, orderId, cartItems)
    .then(() => this.updatePaymentCount())
  }


}
