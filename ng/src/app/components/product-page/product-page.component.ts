import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { HttpClient } from "@angular/common/http";

import { MatPaginator, PageEvent } from '@angular/material/paginator';

import {
  Product
} from '@app/models';

import {
  UtilService
} from '@app/services';

import animations from './product-page.animations';
import { AnimationEvent } from '@angular/animations';

@Component({
  selector: 'app-product-page',
  templateUrl: './product-page.component.html',
  styleUrls: ['./product-page.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations
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
  
  // list containing all products
  fullProductList: Product[];

  // paginated list
  productList: Product[];

  // number of items per page
  pageSize = 6;

  // animate show/hide product items
  productVisibilityState = 'show';

  constructor(
    private http: HttpClient,
    private _utilService: UtilService
  ) {}

  // TODO: get data from back end
  // TODO: move to http service
  ngOnInit(): void {
    this.http.get('assets/mockData/productList.json')
    .subscribe(response => {
      this.fullProductList = response as Product[];
      this.paginator.length = this.fullProductList.length;
      this.updatePageInfo();
    })
  }

  // handle pagination navigation
  handlePaginatorNagivation(event: PageEvent) {
    // flow: click on pagination navigation -> hide animation -> afterProducstAnimation
    const direction = event.pageIndex > event.previousPageIndex! ? 'next' : 'previous';
    direction === 'next' ? this.hideProductsToTheLeft() : this.hideProductsToTheRight();
  }

  // show items depending on page
  updatePageInfo() {
    // PAGINATION FORMULA 
    // from: currentPageIndex * itemsPerPage
    // to:   (currentPageIndex + 1) * itemsPerPage - 1
    this.productList = this._utilService.getFromRange(
      this.fullProductList, 
      this.paginator.pageIndex * this.pageSize, 
      (this.paginator.pageIndex + 1) * this.pageSize - 1
    );
    this.updatePageNumber();
    this.showProductItems();
  }

  // updates page number in pagination
  updatePageNumber() {
    const list = document.getElementsByClassName('mat-mdc-paginator-range-label');
    list[0] && (list[0].innerHTML = 'Page: ' + (this.paginator.pageIndex + 1) + '/' + this.paginator.getNumberOfPages());
  }

  // trigger show animation
  showProductItems() {
    this.productVisibilityState = 'show';
  }
  hideProductsToTheLeft() {
    this.productVisibilityState = 'hideLeft';
  }
  hideProductsToTheRight() {
    this.productVisibilityState = 'hideRight';
  }

  // update page after hide animation is complete
  afterProducstAnimation(ev: AnimationEvent) {
    if (ev.fromState === 'show') {
      this.updatePageInfo();
    }
  }

}
