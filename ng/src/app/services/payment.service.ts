import { Injectable } from '@angular/core';

import {
  HttpService
} from '@app/services';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  constructor(
    private _http: HttpService
  ) {}

  // creates order
  async createOrder(userId: string, cartItems: string[]): Promise<string> {
    return this._http.createOrder(userId, cartItems);
  }

  // handle payment approve
  async handlePaymentApprove(userId: string, orderId: string, cartItems: string[]): Promise<void> {
    return this._http.captureOrder(userId, orderId, cartItems);
  }

}
