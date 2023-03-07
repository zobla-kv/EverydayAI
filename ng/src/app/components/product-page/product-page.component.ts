import { Component, ViewEncapsulation } from '@angular/core';

import { 
  Product
} from '@app/models';

@Component({
  selector: 'app-product-page',
  templateUrl: './product-page.component.html',
  styleUrls: ['./product-page.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProductPageComponent {

  // TODO: put directly in html?
  // buying steps
  buyingSteps = [
    { name: 'Order', icon: 'payment' },
    { name: 'Delivery', icon: 'local_shipping' },
    { name: 'Support', icon: 'record_voice_over' },
  ]

  productList: Product[] = [
    { id: 1, title: 'title-1', description: 'description-1', price: 1, imgPath: '../../../assets/images/img/landing-page-image.jpg' },
    { id: 2, title: 'title-2', description: 'description-2', price: 2, imgPath: '../../../assets/images/img/landing-page-image.jpg' },
    { id: 3, title: 'title-3', description: 'description-3', price: 3, imgPath: '../../../assets/images/img/landing-page-image.jpg' },
    { id: 4, title: 'title-4', description: 'description-4', price: 4, imgPath: '../../../assets/images/img/landing-page-image.jpg' },
  ]

}
