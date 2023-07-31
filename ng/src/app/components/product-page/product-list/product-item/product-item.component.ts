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
    private _sanitizer: DomSanitizer
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

  handleDownload() {
    if (!this.user) {
      this._router.navigate(['auth', 'login']);
      return;
    }

    if (!this.product.imgPath.includes('assets')) {
      // for non 404 images
      this.triggerDownload(this.product.imgPath);
      return;
    }

    this._httpService.getProductImage(this.product.fileName)
    .pipe(first())
    .subscribe(path => {
      if (!path) {
        this._toast.showDefaultError();
        return;
      } else {
        this.triggerDownload(path);
      }
    })
  }

  // trigger download
  triggerDownload(url: string): void {
    const fileName = this.product.title + '.' + this.utilService.getFileExtension(this.product.fileName);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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
    if (!this.user) {
      this._router.navigate(['auth', 'login']);
      return;
    }
    this.product.spinners[ProductActions.CART] = true;
    this._firebaseService.addProductToCart(ProductMapper.getOriginalObject(this.product))
    .then(async () => await this.handleCartActionSucceeded())
    .catch(err => this.handleCartActionFailed())
  }

  // handles remove from cart
  removeFromCart() {
    this.product.spinners[ProductActions.CART] = true;
    this._firebaseService.removeProductFromCart(ProductMapper.getOriginalObject(this.product))
    .then(async () => await this.handleCartActionSucceeded())
    .catch(err => this.handleCartActionFailed())
  }

  // after product was added/removed to cart
  async handleCartActionSucceeded() {
    // this can trigger catch block, for that 'await' is needed
    await this._authService.updateUser();
    this.product.isInCart = !this.product.isInCart;
    if (this.product.isInCart) {
      this._toast.open(ToastConstants.MESSAGES.ADDED_TO_CART, ToastConstants.TYPE.SUCCESS.type);
    } else {
      this._toast.open(ToastConstants.MESSAGES.REMOVED_FROM_CART, ToastConstants.TYPE.SUCCESS.type);
    }
    this.product.spinners[ProductActions.CART] = false;
  }

  // after product failed to be added/removed to cart
  handleCartActionFailed() {
    this.product.spinners[ProductActions.CART] = false;
    this._toast.showDefaultError();
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

  ngOnDestroy(): void {
    this.userStateSub$.unsubscribe();
    this.likesSub$.unsubscribe();
  }

}
