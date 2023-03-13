import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { HttpClient } from "@angular/common/http";

import { MatPaginator, PageEvent } from '@angular/material/paginator';

import {
  Product
} from '@app/models';

import {
  UtilService
} from '@app/services';

@Component({
  selector: 'app-product-page',
  templateUrl: './product-page.component.html',
  styleUrls: ['./product-page.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProductPageComponent implements OnInit {

  // TODO: put directly in html?
  // buying steps
  // buyingSteps = [
  //   { name: 'Order', icon: 'payment' },
  //   { name: 'Delivery', icon: 'local_shipping' },
  //   { name: 'Support', icon: 'record_voice_over' },
  // ]

  @ViewChild('paginator') paginator: MatPaginator;

  // number of items per page
  pageSize = 6;

  // list containing all products
  fullProductList: Product[];

  // paginated list
  productList: Product[];

  constructor(
    private http: HttpClient,
    private _utilService: UtilService
  ) {}

  // TODO: get data from back end
  // TODO: move to http service
  ngOnInit(): void {
    this.http.get('assets/mockData/productList.json')
    .subscribe(response => {
      console.log('paginator: ', this.paginator);
      this.fullProductList = response as Product[];
      this.paginator.length = this.fullProductList.length;
      // TODO: need to find formula for pagination
      this.productList = this._utilService.getFromRange(this.fullProductList, this.paginator.pageIndex, this.pageSize);
    })
  }

  handlePaginator(event: PageEvent) {
    console.log('page event: ', event);
  }

}
