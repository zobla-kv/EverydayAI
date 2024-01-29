import { Component, Input } from '@angular/core';

import {
  ProductMapper
} from '@app/models';

import {
  UtilService
} from '@app/services';

// TODO: adjust for use on home page and cpanel. At the moment only for product details
// TODO: create component for metadata also

@Component({
  selector: 'app-product-price',
  templateUrl: './product-price.component.html',
  styleUrls: ['./product-price.component.scss']
})
export class ProductPriceComponent {

  @Input() product: ProductMapper;

  constructor(
    public utilService: UtilService
  ) {}

}
