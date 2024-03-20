import { Component, Input,  OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import {
  CustomUser,
  ProductMapper
} from '@app/models';

import {
  AuthService,
  UtilService
} from '@app/services';

// TODO: adjust for use on home page and cpanel. At the moment only for product details
// TODO: create component for metadata also

@Component({
  selector: 'app-product-price',
  templateUrl: './product-price.component.html',
  styleUrls: ['./product-price.component.scss']
})
export class ProductPriceComponent implements OnInit, OnDestroy {

  @Input() product: ProductMapper;

  // user sub
  user$: Subscription

  // user
  user: CustomUser | null;

  constructor(
    public utilService: UtilService,
    private _authService: AuthService
  ) {}

  ngOnInit() {
    this.user$ = this._authService.userState$.subscribe(user => this.user = user);
  }

  ngOnDestroy() {
    this.user$.unsubscribe();
  }

}
