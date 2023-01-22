import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-product-page',
  templateUrl: './product-page.component.html',
  styleUrls: ['./product-page.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProductPageComponent {

  // Buying steps

  buyingSteps = [
    { name: 'Order', icon: 'payment' },
    { name: 'Delivery', icon: 'local_shipping' },
    { name: 'Support', icon: 'record_voice_over' },
  ]

}
