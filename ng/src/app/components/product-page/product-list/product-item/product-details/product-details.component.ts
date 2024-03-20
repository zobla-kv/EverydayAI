import { AfterViewInit, Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { Title } from '@angular/platform-browser';

import { catchError, first, throwError } from 'rxjs';

import environment from '@app/environment';

import {
  CustomUser,
  ProductListConfig,
  ProductMapper,
  ProductResponse,
  ToastMessages
} from '@app/models';

import {
  AuthService,
  FirebaseService,
  ModalService,
  PreviousRouteService,
  ProductService,
  ToastService
} from '@app/services';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss']
})
export class ProductDetailsComponent implements OnInit, AfterViewInit {

  // NOTE: Using id for route instead of name because unique name conflict requires additional implementation

  // back/forward button
  @HostListener('window:popstate', ['$event'])
  onPopState(event: any) {
    this.isClosedByBackButton = true;
    this._modalService.close();
  }

  // product
  product: ProductMapper;

  // modal name (should be unique across app)
  modalName = 'product_details';

  // is closed by back button?
  isClosedByBackButton: boolean;

  // is logged in
  user: CustomUser | null;

  constructor(
    private _modalService: ModalService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _firebaserService: FirebaseService,
    private _toast: ToastService,
    private _location: Location,
    private _authService: AuthService,
    private _titleService: Title,
    public   productService: ProductService,
    private _previousRouteService: PreviousRouteService
  ) {
    // if opened from product page
    this.product = this._router.getCurrentNavigation()?.extras.state as ProductMapper;
    this.product && this._titleService.setTitle(this.product.title);
  }

  ngOnInit() {
    this._authService.userState$.pipe(first()).subscribe(user => {
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
          // invalid id check
          if (products.length === 0) {
            // TODO: error handling (route protection) can be done using resolver
            this._toast.showErrorMessage(ToastMessages.PRODUCT_NOT_FOUND);
            this._router.navigate(['images']);
            return;
          }
          // fetch is triggered after user only because of mapper
          this.product = ProductMapper.getInstance(products[0], ProductListConfig.PRODUCT_LIST, this.user);
          this._titleService.setTitle(this.product.title);
          // wait for modal to load
          setTimeout(() => this._modalService.open(this.modalName), 100);
        },
        error: (e) => {
          this._toast.showErrorMessage(ToastMessages.PRODUCT_FAILED_TO_LOAD_DETAILS);
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
    this.productService.productDetailsClosed$.next();
    if (this.isClosedByBackButton) {
      this.isClosedByBackButton = false;
      return;
    }

    // if user came from hp/copy-paste
    if (!this._previousRouteService.getPreviousUrl()?.includes('images')) {
      this._router.navigate(['images']);
      return;
    }

    // TODO: causes a small bug. Have search value. Open product details. Refresh. Close product details.
    // There is old search query in url and doc and page titles are mismatched
    this._location.back();
  }

  // keep order of keyvalue pipe (not DRY)
  keepOrder() { return 0; }

}
