import { Component } from '@angular/core';
import { Subscription } from 'rxjs';

import {
  ProductCategory
} from '@app/models';

import {
  SpinnerService
} from '@app/services';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent {

  productCategories: ProductCategory[] = [
    { name: 'Food' },
    { name: 'Toys' },
    { name: 'Medicine' },
    { name: 'Training' }
  ];

  isLoading: boolean = false;

  // spinner sub
  spinnerSub: Subscription;

  constructor(
    private spinnerService: SpinnerService
  ) {}

  ngOnInit(): void {
    this.spinnerSub = this.spinnerService.spinner$.subscribe(() => this.handleSpinner())
  }

  handleSpinner() {
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
    }, 2000)
  }

  ngOnDestroy(): void {
    this.spinnerSub.unsubscribe();
  }

}
