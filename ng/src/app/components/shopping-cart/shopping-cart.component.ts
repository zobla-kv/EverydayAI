import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs';

import {
  AuthService, ToastService
} from '@app/services';

@Component({
  selector: 'app-shopping-cart',
  templateUrl: './shopping-cart.component.html',
  styleUrls: ['./shopping-cart.component.scss']
})
export class ShoppingCartComponent implements OnInit {

  constructor(
    private _authService: AuthService,
    private _toast: ToastService
  ) {}


  ngOnInit() {
    this._authService.userState$.pipe(first()).subscribe(user => {
      console.log('user: ', user);
    })
  }

}
