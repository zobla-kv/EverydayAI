import { Component } from '@angular/core';


import {
  ProductListConfig
} from '@app/models';

@Component({
  selector: 'app-product-page-old',
  templateUrl: './product-page-old.component.html',
  styleUrls: ['./product-page-old.component.scss']
})
// export class ProductPageComponent implements OnInit {
export class ProductPageOldComponent {

  // use in template
  readonly productListConfig = ProductListConfig;

  constructor() {}

  handleTabChange() {
    console.log('fired')
  }
}
