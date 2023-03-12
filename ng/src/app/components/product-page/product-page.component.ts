import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { HttpClient } from "@angular/common/http";

import {
  Product
} from '@app/models';

@Component({
  selector: 'app-product-page',
  templateUrl: './product-page.component.html',
  styleUrls: ['./product-page.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProductPageComponent implements OnInit {

  // TODO: put directly in html?
  // buying steps
  buyingSteps = [
    { name: 'Order', icon: 'payment' },
    { name: 'Delivery', icon: 'local_shipping' },
    { name: 'Support', icon: 'record_voice_over' },
  ]

  productList: Product[];

  constructor(
    private http: HttpClient
  ) {}

  // TODO: get data from back end
  // TODO: move to http service
  ngOnInit(): void {
    this.http.get('assets/mockData/productList.json')
    .subscribe(response => {
      console.log('fetch data: ', response);
      this.productList = response as Product[];
    })
  }

}
