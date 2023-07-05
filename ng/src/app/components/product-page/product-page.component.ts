import { Component, OnInit } from '@angular/core';

import { Subscription, concatMap, first, of, tap } from 'rxjs';

import { 
  AuthService,
  FirebaseService
} from '@app/services';

import { 
  CustomUser,
  Product,
  ProductActions
} from '@app/models';

@Component({
  selector: 'app-product-page',
  templateUrl: './product-page.component.html',
  styleUrls: ['./product-page.component.scss']
})
export class ProductPageComponent implements OnInit {

  // use in template
  readonly productActions = ProductActions;

  // one list contains that contains all products, for both tabs
  productList: Product[];

  // products for shop tab
  shopProductList: Product[] = [];

  // products for owned items tab
  ownedProductList: Product[] = [];

  // current user
  user: CustomUser | null;

  // user sub
  userStateSub$: Subscription;

  constructor(
    private _authService: AuthService,
    private _firebaseService: FirebaseService
  ) {
  }

  // TODO: Important! error handling
  // TODO: keep data when routing (reuse strategy) so it wouldn't reach DB every time
  ngOnInit(): void {
    this.userStateSub$ = this._authService.userState$
    .pipe(
      concatMap((value, index) => {
        // trigger only on first emission (index 0)
        if (index === 0) {
          return of(value).pipe(tap(() => this.fetchProducts()))
        }
        return of(value)
      })
    )
    .subscribe(user => user && (this.user = user));
  }

  // fetch products from BE
  fetchProducts(): void {
    this._firebaseService.getProducts().pipe(first()).subscribe(products => {
      console.log('products: ', products);
      this.setProductsForEachTab(products);
    })
  }

  // create new list for each tab from all products
  setProductsForEachTab(products: Product[]): void {
    if (this.user) {
      this.shopProductList = products.filter(product => !this.user?.ownedItems?.includes(product.id));
      this.ownedProductList = products.filter(product => this.user?.ownedItems?.includes(product.id));
    } else {
      this.shopProductList = products;
      this.ownedProductList = [];
    }
  }

  handleTabChange() {
    console.log('fired')
  }
}
