import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Subscription, first, mergeMap } from 'rxjs';

import {
  CustomUser,
  ProductListConfig,
  ProductMapper,
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

  // table of contents
  @ViewChild('toc') toc: ElementRef;
  // questionmark
  @ViewChild('questionmark') questionmark: ElementRef;

  // is first visit
  isFirstVisit = this._utilService.isFirstVisit();

  // is logged in
  user: CustomUser | null;

  // user sub
  userStateSub$: Subscription;

  // what section is active (scrolled to)
  activeSection: string = 'Introduction';
  // section scroll easing
  sectionScrollEasing = (t: number, b: number, c: number, d: number): any => {
    // easeInOutExpo easing
    if (t === 0) {
      return b;
    }
    if (t === d) {
      return b + c;
    }
    if ((t /= d / 2) < 1) {
      return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
    }
    return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
  };

  // our picks list config
  ourPicksListConfig = ProductListConfig.HOME_PAGE_OUR_PICKS;
  // our products to be fetched
  // WARNING: large image size causes page to lag
  ourPicksProductIds = ['ijZ4bgWxPhtePi23qDpB', 'kzE6iN9v0jwKwmbkvZH7', 'qW7hGr7O1JcKb3jXjTrC'];
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
    // TODO: use mergeMap on other places
    this.userStateSub$ = this._authService.userState$
    .pipe(
      first(),
      mergeMap(user => {
        this.user = user;
        return this._httpService.getProducts(ProductType.ALL, null, this.ourPicksProductIds);
      })
    )
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

    // TODO: only on large screen
    this.setScrollListenerForToc();
    this.observeQuestionmark();
  }

  // run hover animation once cta element is displayed to get focus on that
  hightlightCTA(element: any) {
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

  // show toc when scroll when distance from top is smaller than 400px
  setScrollListenerForToc() {
    const handleScroll = () => {
      const distanceFromTop = this.toc.nativeElement.getBoundingClientRect().top;
      if (distanceFromTop < 400) {
        this._renderer.addClass(this.toc.nativeElement, 'show');
        window.removeEventListener('scroll', handleScroll);
      }
    }
    window.addEventListener('scroll', handleScroll);
  }

  // disable questionmark animation when off screen
  observeQuestionmark() {
    new IntersectionObserver(entries => {
      entries.forEach(entry => {
          if (entry.isIntersecting) {
            this._renderer.addClass(this.questionmark.nativeElement, 'animate');
          } else {
            this._renderer.removeClass(this.questionmark.nativeElement, 'animate');
          }
      });
    }).observe(this.questionmark.nativeElement);
  }

  handleProductImgLoadError(ev: Event) {
    this.utilService.set404Image(ev.target);
  }

  ngOnDestroy() {
    this.userStateSub$ && this.userStateSub$.unsubscribe();
  }

}
