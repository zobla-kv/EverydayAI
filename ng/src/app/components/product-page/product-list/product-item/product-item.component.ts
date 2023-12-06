import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ProductMapper, ProductTypePrint, CustomUser } from '@app/models';
import { AuthService, UtilService, ProductService } from '@app/services';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-product-item',
  templateUrl: './product-item.component.html',
  styleUrls: ['./product-item.component.scss']
})
export class ProductItemComponent implements OnInit, OnDestroy {

  // product
  @Input('product') product: ProductMapper<ProductTypePrint>;
  // animation stagger
  @Input('stagger') stagger: number;

  // current user
  user: CustomUser | null;

  // user sub
  userStateSub$: Subscription;

  constructor(
    private _authService: AuthService,
    private _productService: ProductService,
    public   utilService: UtilService,
  ) {}

  async ngOnInit() {
    this.userStateSub$ = this._authService.userState$.subscribe(user => this.user = user);
  }

  // handles add to cart
  addToCart() {
    this._productService.addToCart(this.product);
  }

  // handles remove from cart
  removeFromCart() {
    this._productService.removeFromCart(this.product);
  }

  // handle download
  handleDownload() {
    this._productService.download(this.product);
  }

  ngOnDestroy(): void {
    this.userStateSub$ && this.userStateSub$.unsubscribe();
  }

}
