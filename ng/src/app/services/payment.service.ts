import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { first } from 'rxjs';
import { HttpService } from './http.service';

import { 
  CustomUser 
} from '@app/models';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  // user id
  user: CustomUser;

  constructor(
    private _authService: AuthService,
    private _http: HttpService
  ) { 
    this._authService.userState$.pipe(first()).subscribe(user => {
      console.log('payment service user: ', user);
      if (!user) {
        console.log('THER IS NO USAR!')
        return;
      }
      this.user = user;
    });
  }

  async processPayment() {
    console.log('processing payment');
    this._http.initiatePayment(this.user);
  }
}
