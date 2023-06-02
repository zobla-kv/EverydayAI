import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';

import { 
  CustomUser, 
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

  // user id
  user: CustomUser;

  // user state sub
  userStateSub$: Subscription;

  constructor(
    private _authService: AuthService,
    private _http: HttpService,
    private _toast: ToastService
  ) { 
    this.userStateSub$ = this._authService.userState$.subscribe(user => {
      console.log('payment service user: ', user);
      if (!user) {
        console.log('THER IS NO USER!')
        return;
      }
      this.user = user;
    });
  }

  async processPayment() {
    console.log('processing payment');
    this._http.initiatePayment(this.user)
    .then(response => {
      console.log('payment service success response: ', response);
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

  ngOnDestroy() {
    this.userStateSub$.unsubscribe();
  }
}
