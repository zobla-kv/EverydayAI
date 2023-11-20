import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, QueryList, Renderer2, ViewChildren } from '@angular/core';
import { Observable, Subscription, first, fromEvent, interval, merge, throttle } from 'rxjs';

import {
  CustomUser,
  ProductActions,
  ProductListConfig,
  ProductMapper,
  ProductResponse,
  ProductType,
  ProductTypePrint
} from '@app/models';

import {
  AuthService,
  HttpService,
  ProductService,
  UtilService
} from '@app/services';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChildren('carouselItem') carouselItemsRef: QueryList<HTMLImageElement>;
  @ViewChildren('bullet') bulletPoints: QueryList<ElementRef>;

  // carousel items
  carouselItems = [
    { id: 2, name: 'open-minded', imgSrc: '../../../assets/images/img/open-minded-big.jpg', htmlElement: null },
    { id: 1, name: 'courage', imgSrc: '../../../assets/images/img/courage-big.jpg', htmlElement: null },
    { id: 0, name: 'enthusiast', imgSrc: '../../../assets/images/img/dog-enthusiast-big.jpg', htmlElement: null },
  ];

  // is playing
  isCarouselPlaying = false;

  // carousel image change time
  carouselInterval = 5000;

  // bullet points hover observable
  bulletPointsHover$: Observable<any>;

  // is first visit
  isFirstVisit = this._utilService.isFirstVisit();

  // is logged in
  user: CustomUser | null;

  // user sub
  userStateSub$: Subscription;

  // our picks list config
  ourPicksListConfig = ProductListConfig.HOME_PAGE_OUR_PICKS;
  // our products to be fetched
  // WARNING: large image size causes page to lag
  ourPicksProductIds = ['BMvzFFlcnLUPK7eiZQCj', 'Uhuui8b3DQvUBUY94VzY', 'bjwQViG8djMs5tDEzp0I'];
  // our picks fetched products
  ourPicksProducts: ProductMapper<ProductTypePrint>[] = [];
  // are our picks loaded
  ourPicksLoaded = false;
  // are our picks loaded with error
  ourPicksError = false;

  constructor(
    private _authService: AuthService,
    private _utilService: UtilService,
    private _el: ElementRef,
    private _renderer: Renderer2,
    private _httpService: HttpService,
    public   productService: ProductService,
    public   utilService: UtilService
  ) {
    // NOTE: is loaded from another route
    // const isLoadedFromAnotherRoute = Boolean(this._router.getCurrentNavigation()?.previousNavigation);
  }

  ngOnInit() {
    this.userStateSub$ = this._authService.userState$.subscribe(user => user && (this.user = user));
    this._httpService.getProducts(ProductType.ALL, null, this.ourPicksProductIds)
    .pipe(first())
    .subscribe(products => {
      // TODO: sorted automatically by id, dont want this
      this.ourPicksProducts = products.map((product: any) => new ProductMapper<ProductTypePrint>(product, this.ourPicksListConfig, this.user));

      // 404 images allowed to show
      if (products.length !== this.ourPicksListConfig.pageSize) {
        this.ourPicksError = true;
      }

      this.ourPicksLoaded = true;
    });
  }

  ngAfterViewInit() {
    // NOTE: fix for zoom out - required for .viewport-height when dynamic (responsive)
    // first set to 100vh then change to same size in pixels

    // *** TOP SECTION ***
    const landingSection: HTMLElement = this._el.nativeElement.querySelector('.top-section');
    landingSection.style.maxHeight = landingSection.offsetHeight + 'px';
    landingSection.style.minHeight = landingSection.offsetHeight + 'px';

    // setTimeout(() => this.showOurPicks(), 3000)

    // this.setBulletPointsHover();
    // this.bulletPointsHover$ = merge(
    //   this.bulletPoints.map(bullet => fromEvent(bullet.nativeElement, 'hover'))
    // );

  }

  // run hover animation once cta button is displayed to get eyes to focus on that
  hightlightCTAButton(element: HTMLButtonElement) {
    // run after animation is done, delay + duration
    const delay = this.isFirstVisit ? 1800 : 1200 + 600;
    setTimeout(() => {
      element.classList.add('highlighted');
    }, delay);
  }
  // copy of above one with different delay
  // TODO: move to directive because not DRY
  hightlightProduct(element: HTMLElement, elementDelay: number = 0) {
    // run after animation is done, delay + duration
    const delay = 350 + elementDelay;
    setTimeout(() => {
      element.classList.add('highlighted');
    }, delay);
  }

  // setOurPicks(products: ProductResponse[]) {
  //   const ourPicks = products.map(product => ({
  //     ...product,
  //     // directive
  //     hideStyles: {'opacity': 0, 'transform': 'translateY(-40px)'},
  //     showStyles: {'opacity': 1, 'transform': 'translateY(0px)'},
  //     threshold: 0.8,

  //   }))
  //   this.ourPicksProducts = products;
  // }


  // sets config for carousel
  setCarousel() {
    this.carouselItems.forEach((item, index) => {
      item.htmlElement = (this.carouselItemsRef.get(index) as any).nativeElement;
    })

    // play carousel
    setTimeout(() => this.playCarousel(), this.carouselInterval);

    // REF: same handler for multiple events, with throttle
    // merge(
    //   fromEvent(this.bulletPoints.get(0)!.nativeElement, 'mouseenter', () => 0),
    //   fromEvent(this.bulletPoints.get(1)!.nativeElement, 'mouseenter', () => 1),
    //   fromEvent(this.bulletPoints.get(2)!.nativeElement, 'mouseenter', () => 2)
    // )
    // // .pipe(throttle(() => interval(500)))
    // .subscribe(data => this.handleHover(data))
  }

  // plays carousel
  async playCarousel() {
    this.isCarouselPlaying = true;
    while (this.isCarouselPlaying) {
      const activeImage = this.carouselItems[this.carouselItems.length - 1].htmlElement;
      // hide active
      this._renderer.addClass(activeImage, 'hide');
      // wait before changing image
      await this._utilService.sleep(this.carouselInterval);
      // shift array
      this.carouselItems = this._utilService.rotateArrayToRight(this.carouselItems);
      // show previously hidden image
      this._renderer.removeClass(activeImage, 'hide');
    }
  }

  // stops carousel
  disableCarousel() {
    this.isCarouselPlaying = false;
  }

  ngOnDestroy() {
    this.userStateSub$ && this.userStateSub$.unsubscribe();
  }

}
