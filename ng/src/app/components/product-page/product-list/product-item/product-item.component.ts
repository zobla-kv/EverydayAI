import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { MatTooltip } from '@angular/material/tooltip';
import { DecimalPipe } from '@angular/common'

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
  ProductTypePrint
} from '@app/models';

@Component({
  selector: 'app-product-item',
  templateUrl: './product-item.component.html',
  styleUrls: ['./product-item.component.scss'],
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

  constructor(
    private _authService: AuthService,
    private _productLikeService: ProductLikeService,
    private _firebaseService: FirebaseService,
    private _toast: ToastService,
    private _router: Router,
    private _httpService: HttpService,
    public   utilService: UtilService,
    private _decimalPipe: DecimalPipe
  ) {
  }

  ngOnInit() {
    this.userStateSub$ = this._authService.userState$.subscribe(user => user && (this.user = user));
    this.likesSub$ = this._productLikeService.likes$.subscribe((likes: number[]) => {
      if (this.actions.includes(ProductActions.LIKE)) {
        this.isLiked = likes.includes(this.product.id);
      }
    });  
  }

  ngAfterViewInit() {
    this.likesTooltip.message = this.formatNumberOfLikes(this.product.likes);
  }

  // emit event once img is loaded
  handleImageLoaded() {
    this.imgLoaded.emit();
  }

  // emit event if img fails to load
  handleImageLoadError(ev: any) {
    // TODO: replace src
    ev.target.src = '../../../../../assets/images/img/cesar-millan.png';
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
  handleDownload() {
    // TODO: error handling
    if (!this.user) {
      this._router.navigate(['auth', 'login']);
      return;
    }
    this._httpService.fetchImageUrlAsBlob(this.product.imgPath)
    .pipe(first())
    .subscribe(blob => {
       if (!blob) {
         this._toast.showDefaultError();
         return;
       }
       const url = URL.createObjectURL(blob);
       // TODO: does this really turn img into .png (.jfif to .png)
       const fileName = this.product.description + '.png';
       const a = document.createElement('a');
       a.href = url;
       a.download = fileName;
       document.body.appendChild(a);
       a.click();
       document.body.removeChild(a);
    });
  }

  ngOnDestroy(): void {
    this.userStateSub$.unsubscribe();
    this.likesSub$.unsubscribe();
  }

}
