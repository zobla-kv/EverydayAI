import { AfterViewInit, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { Subscription, catchError, first, throwError } from 'rxjs';

import {
  CustomUser,
  ProductListConfig,
  ProductMapper,
  ProductResponse,
  ProductTypePrint,
  ToastConstants
} from '@app/models';

import {
  AuthService,
  FirebaseService,
  ModalService,
  ProductService,
  ToastService
} from '@app/services';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss']
})
export class ProductDetailsComponent implements OnInit, AfterViewInit, OnDestroy {

  // NOTE: Using id for route instead of name because unique name conflict requires additional implementation

  // back/forward button
  @HostListener('window:popstate', ['$event'])
  onPopState(event: any) {
    this.isClosedByBackButton = true;
    this._modalService.close();
  }

  // product
  product: ProductMapper<ProductTypePrint>;

  // modal name (should be unique across app)
  modalName = 'product_details';

  // is closed by back button?
  isClosedByBackButton: boolean;

  // is logged in
  user: CustomUser | null;

  // user sub
  userStateSub$: Subscription;

  constructor(
    private _modalService: ModalService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _firebaserService: FirebaseService,
    private _toast: ToastService,
    private _location: Location,
    private _authService: AuthService,
    private _productService: ProductService
  ) {
    // if opened from product page
    this.product = this._router.getCurrentNavigation()?.extras.state as ProductMapper<ProductTypePrint>;
  }

  ngOnInit() {
    this.userStateSub$ = this._authService.userState$.subscribe(user => {
      user && (this.user = user);

      // if opened on load
      if (!this.product) {
        fetchProduct();
      }
    });

    const fetchProduct = () => {
      const productId = this._route.snapshot.paramMap.get('id') as string;
      this._firebaserService.getProductsById([productId])
      .pipe(
        first(),
        catchError(err => throwError(() => new Error()))
      )
      .subscribe({
        next: (products: ProductResponse[]) => {
          console.log('good response: ', products);
          // invalid id check
          if (products.length === 0) {
            // TODO: not good, on copy-paste it goes back to google
            // TODO: try removing load animation on products page / details because of copy paste
            // TODO: also cant see error becuase of it
            // TODO: error handling (route protection) can be done using resolver
            this.handleClose();
            return;
          }
          // fetch is triggered after user only because of mapper
          this.product = new ProductMapper<ProductTypePrint>(products[0] as any, ProductListConfig.PRODUCT_LIST, this.user);
          // wait for modal to load
          setTimeout(() => this._modalService.open(this.modalName), 100);
        },
        error: (e) => {
          console.log('error response: ', e);
          this._toast.open(ToastConstants.MESSAGES.PRODUCT_FAILED_TO_LOAD_DETAILS, ToastConstants.TYPE.ERROR.type);
        }
      })
    }
  }

  ngAfterViewInit() {
    // if loaded from products page
    if (this.product) {
      // because of angular error (change after expression checked)
      setTimeout(() => this._modalService.open(this.modalName))
    }
  }

  // handle close event
  handleClose() {
    console.log('closed')
    if (this.isClosedByBackButton) {
      this.isClosedByBackButton = false;
      return;
    }
    this._location.back();
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

  // keep order of keyvalue pipe (not DRY)
  keepOrder() { return 0; }

  ngOnDestroy() {
    this.userStateSub$ && this.userStateSub$.unsubscribe();
  }

}
