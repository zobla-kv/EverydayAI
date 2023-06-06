import { Injectable } from '@angular/core';

import { 
  CustomUser,
  PaymentCard,
  PaymentObject,
  ToastConstants 
} from '@app/models';

import {
  AuthService,
  HttpService,
  ToastService
} from '@app/services';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  constructor(
    private _authService: AuthService,
    private _http: HttpService,
    private _toast: ToastService
  ) {}

  async processPayment(user: CustomUser, card: any) {
    return this._http.initiatePayment(this.createPaymentObject(user, card))
    .then(response => {
      // TODO: !important handle other statuses (see official docs)
      if (response.error) {
        this._toast.open(ToastConstants.MESSAGES.PAYMENT_FAILED, ToastConstants.TYPE.ERROR.type);
      }
      if (response.paymentStatus === 'succeeded') {
        this._toast.open(ToastConstants.MESSAGES.PAYMENT_SUCCESSFUL, ToastConstants.TYPE.SUCCESS.type);
        this._authService.updateUser();
      }
    })
    .catch(err => {
      this._toast.open(ToastConstants.MESSAGES.PAYMENT_FAILED, ToastConstants.TYPE.ERROR.type);
    })
  }

  // creates payment object that is sent to http
  createPaymentObject(user: CustomUser, card: PaymentCard): PaymentObject {
    return {
      user: {
        id: user.id,
        email: user.email,
        shopping_cart_items: user.cart.items.map(item => (
          { id: item.id, title: item.title }
        )),
        stripeId: user.stripe?.id,
        card: {
          holder_name: card.holder_name,
          number: card.number,
          expiration_date: card.expiration_date,
          expiration_date_month: this.getExpirationDateMonth(card.expiration_date),
          expiration_date_year: this.getExpirationDateYear(card.expiration_date),
          cvc: card.cvc
        }
      }
    }
  }

  // returns first part of MM/YYYY
  getExpirationDateMonth(expirationDate: string): string {
    const month = expirationDate.split('/')[0];
    return month;
  }
  // returns second part of MM/YYYY
  getExpirationDateYear(expirationDate: string): string {
    const year = expirationDate.split('/')[1];
    return year;
  }

}
