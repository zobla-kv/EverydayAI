import { AfterViewInit, Component, EventEmitter, Input,
         OnDestroy, OnInit, Output, ViewChild, ViewEncapsulation, ElementRef
} from '@angular/core';
import { Router } from '@angular/router';
import { MatTooltip } from '@angular/material/tooltip';
import { DecimalPipe } from '@angular/common'
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

import { Subscription, first } from 'rxjs';

import {
  AuthService,
  FirebaseService,
  HttpService,
  ProductLikeService,
  ProductService,
  ToastService,
  UtilService
} from '@app/services';

import {
  CustomUser,
  ToastConstants,
  ProductActions,
  ProductMapper,
  ProductTypePrint,
} from '@app/models';

@Component({
  selector: 'app-product-item',
  templateUrl: './product-item.component.html',
  styleUrls: ['./product-item.component.scss'],
  // TODO: update to ngdeep and remove this
  encapsulation: ViewEncapsulation.None,
})
export class ProductItemComponent implements OnInit, AfterViewInit, OnDestroy {

  // tooltip that shows number of likes on product
  @ViewChild('tooltip') likesTooltip: MatTooltip;

  // use in template
  readonly productActions = ProductActions;

  // product
  @Input('product') product: ProductMapper<ProductTypePrint>;

  // actions a product can peform
  @Input('actions') actions: string[];

  // type of product, used for dynamic css table
  @Input('type') type: string;

  // product img loaded event
  @Output() imgLoaded = new EventEmitter<void>();

  // current user
  user: CustomUser | null;

  // user sub
  userStateSub$: Subscription;

  // likes sub
  likesSub$: Subscription;

  // is product liked
  isLiked: boolean;

  // product image blob safe url
  productImageBlobUrlSafe: SafeUrl

  constructor(
    private _authService: AuthService,
    private _productLikeService: ProductLikeService,
    private _firebaseService: FirebaseService,
    private _toast: ToastService,
    private _router: Router,
    private _httpService: HttpService,
    public   utilService: UtilService,
    private _decimalPipe: DecimalPipe,
    private _sanitizer: DomSanitizer,
    private _productService: ProductService
  ) {
  }

  async ngOnInit() {
    this.productImageBlobUrlSafe = this._sanitizer.bypassSecurityTrustUrl(this.product.imgPath);
    this.userStateSub$ = this._authService.userState$.subscribe(user => user && (this.user = user));
    this.likesSub$ = this._productLikeService.likes$.subscribe((likes: string[]) => {
      if (this.actions.includes(ProductActions.LIKE)) {
        this.isLiked = likes.includes(this.product.id);
      }
    });
  }

  ngAfterViewInit() {
    this.likesTooltip && (this.likesTooltip.message = this.formatNumberOfLikes(this.product.likes));
  }

  // emit event once img is loaded
  handleImageLoaded() {
    this.imgLoaded.emit();
  }

  // because tooltip is on moving element, it can appear too early and cause flick
  showTooltip() {
    this.likesTooltip.disabled = false;
    this.likesTooltip.show();
  }
  hideTooltip() {
    this.likesTooltip.hide();
    this.likesTooltip.disabled = true;
  }

  // used to keep order in keyvalue pipe (it sorts by default)
  keepOrder() { return 0; }

  // handles add to cart
  addToCart() {
    this._productService.addToCart(this.product);
  }

  // handles remove from cart
  removeFromCart() {
    this._productService.removeFromCart(this.product);
  }

  // TODO: move likes func. to product service
  // handle like
  handleLike() {
    this.likesTooltip.show();
    if (this.isLiked) {
      return;
    }
    // fix flick on click
    this.likesTooltip.tooltipClass = 'keep-position';
    this.product.likes++;
    this.likesTooltip.message = this.formatNumberOfLikes(this.product.likes);
    this._productLikeService.addLike(this.product.id, this.user);
  }

  getLikeIcon() {
    if (this.isLiked) {
      return 'favorite'
    }
    return 'favorite_border'
  }

  // add thousand separator to number of likes and change to string
  formatNumberOfLikes(likes: number): string {
    return this._decimalPipe.transform(likes, '.0')?.replace(',', '.') + '';
  }

  // handle download
  handleDownload() {
    this._productService.download(this.product);
  }

  ngOnDestroy(): void {
    this.userStateSub$.unsubscribe();
    this.likesSub$.unsubscribe();
  }

}
