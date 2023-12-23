import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatTooltip } from '@angular/material/tooltip';
import { Subscription } from 'rxjs';

import {
  ProductMapper,
  ProductTypePrint,
  CustomUser,
  ProductActions
} from '@app/models';

import {
  AuthService,
  UtilService,
  ProductService,
  ProductLikeService
} from '@app/services';

// TODO: erorr images display, to be handled in cloudinary transformations? + local
// maybe it fails to show sometimes because of settimeout time

@Component({
  selector: 'app-product-item',
  templateUrl: './product-item.component.html',
  styleUrls: ['./product-item.component.scss']
})
export class ProductItemComponent implements OnInit, AfterViewInit, OnDestroy {
  // tooltip that shows number of likes on product
  @ViewChild('tooltip') likesTooltip: MatTooltip;

  // product
  @Input('product') product: ProductMapper<ProductTypePrint>;
  // actions a product can peform
  @Input('actions') actions: string[];
  // animation stagger
  @Input('stagger') stagger: number;

  // use in template
  readonly productActions = ProductActions;

  // current user
  user: CustomUser | null;

  // user sub
  userStateSub$: Subscription;

  // likes sub
  likesSub$: Subscription;
  // is product liked
  isLiked: boolean;

  constructor(
    private _authService: AuthService,
    private _productService: ProductService,
    public   utilService: UtilService,
    private _productLikeService: ProductLikeService,
    private _decimalPipe: DecimalPipe
  ) {}

  ngOnInit() {
    this.userStateSub$ = this._authService.userState$.subscribe(user => this.user = user);
    this.likesSub$ = this._productLikeService.likes$.subscribe((likes: string[]) => {
      if (this.actions.includes(ProductActions.LIKE)) {
        this.isLiked = likes.includes(this.product.id);
      }
    });
  }

  ngAfterViewInit() {
    this.likesTooltip && (this.likesTooltip.message = this.formatNumberOfLikes(this.product.likes));
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

  // because tooltip is on moving element, it can appear too early and cause flick
  showTooltip() {
    this.likesTooltip.disabled = false;
    this.likesTooltip.show();
  }
  hideTooltip() {
    this.likesTooltip.hide();
    this.likesTooltip.disabled = true;
  }

  // add thousand separator to number of likes and change to string
  formatNumberOfLikes(likes: number): string {
    return this._decimalPipe.transform(likes, '.0')?.replace(',', '.') + '';
  }

  ngOnDestroy(): void {
    this.userStateSub$ && this.userStateSub$.unsubscribe();
    this.likesSub$ && this.likesSub$.unsubscribe();
  }

}
