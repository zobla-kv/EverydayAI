import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';
import { Subscription } from 'rxjs';

import {
  ProductMapper,
  CustomUser,
  ProductActions
} from '@app/models';

import {
  AuthService,
  UtilService,
  ProductService,
  FirebaseService
} from '@app/services';

import {
  FormatPipe
} from '@app/pipes';

@Component({
  selector: 'app-product-item',
  templateUrl: './product-item.component.html',
  styleUrls: ['./product-item.component.scss']
})
export class ProductItemComponent implements OnInit, OnDestroy {
  // tooltip that shows number of likes on product
  @ViewChild('tooltip') likesTooltip: MatTooltip;

  // product
  @Input('product') product: ProductMapper;
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

  // disable animation after load to prevent show animation from running on reuse strategy
  disableAnimation = false;

  constructor(
    private _authService: AuthService,
    public   productService: ProductService,
    private _firebaseService: FirebaseService,
    private _formatPipe: FormatPipe,
    public   utilService: UtilService
  ) {}

  ngOnInit() {
    // NOTE: this solves 404 issue with items not displayed, displaying them but without animation
    setTimeout(() => this.disableAnimation = true, 3000);
    this.isLiked = this.product.likes > 0 ? true : false;
    this.userStateSub$ = this._authService.userState$.subscribe(user => {
      this.user = user;
      this.isLiked = user?.productLikes.includes(this.product.id) ? true : false;
    });
  }

  ngAfterViewInit() {
    this.likesTooltip && (this.likesTooltip.message = this._formatPipe.transform(this.product.likes));
  }

  // handle like
  handleLike() {
    this.likesTooltip.show();
    if (this.isLiked) {
      return;
    }
    // fix flick on click
    this.likesTooltip.tooltipClass = 'keep-position';
    this.product.likes++;
    this.isLiked = true;
    this.likesTooltip.message = this._formatPipe.transform(this.product.likes);
    this._firebaseService.addProductLike(this.product.id, this.user);
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

  ngOnDestroy(): void {
    this.userStateSub$ && this.userStateSub$.unsubscribe();
  }

}

