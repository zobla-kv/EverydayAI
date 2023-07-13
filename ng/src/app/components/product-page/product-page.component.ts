import { Component } from '@angular/core';


import { 
  ProductListConfig
} from '@app/models';

@Component({
  selector: 'app-product-page',
  templateUrl: './product-page.component.html',
  styleUrls: ['./product-page.component.scss']
})
// export class ProductPageComponent implements OnInit {
export class ProductPageComponent {

  // use in template
  readonly productListConfig = ProductListConfig;

  constructor() {}

  handleTabChange() {
    console.log('fired')
  }
}
