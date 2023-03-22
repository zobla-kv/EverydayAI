import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { AnimationEvent } from '@angular/animations';
import { map } from 'rxjs/internal/operators/map';

import {
  Product
} from '@app/models';

import {
  HttpService,
  UtilService
} from '@app/services';

import animations from './product-page.animations';

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

  // products loading spinner
  showSpinner = false;

  // number of loaded images
  numOfloadedImages = 0;

  constructor(
    private _httpService: HttpService,
    private _utilService: UtilService
  ) {}

  // TODO: error handling
  // TODO: keep data when routing so it wouldn't reach DB every time
  ngOnInit(): void {
    this.showSpinner = true;
    this._httpService.getProducts()
    .pipe(
      map((products: Product[]) => {
        // multiply items
        // TODO: remove later
        for(let i = 0; i < 10; i++) {
          products.push(products[0]);
        }
        // add spinners property
        return products.map(product => product = {
          ...product,
          spinners: {
            showAddToCartSpinner: false,
            showRemoveFromCartSpinner: false
          }
        })
      })
    )
    .subscribe(products => {
      this.fullProductList = products as unknown as Product[];
      this.paginator.length = this.fullProductList.length;
      this.updatePageInfo();
    })
  }

  // TODO: runs on each page
  // TODO: maybe add checks (img.complete && img.naturalWidth ~) ?
  handleImageLoaded() {
    if (++this.numOfloadedImages === this.pageSize) {
      this.showSpinner = false;
    }
  }

  // handle pagination navigation
  handlePaginatorNagivation(event: PageEvent) {
    // flow: click on pagination navigation -> hide animation -> afterChangePageAnimation
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
  afterChangePageAnimation(ev: AnimationEvent) {
    if (ev.fromState === 'show') {
      this.updatePageInfo();
    }
  }

  // handles add to cart
  addToCart(productId: number) {
    let targetProduct: any = this.productList.find(product => product.id === productId);
    targetProduct && (targetProduct.spinners.showAddToCartSpinner = true);
  }

  // handles remove from cart
  removeFromCart(productId: number) {
    let targetProduct: any = this.productList.find(product => product.id === productId);
    targetProduct && (targetProduct.spinners.showRemoveFromCartSpinner = true);
  }

}
