import { AfterViewInit, Component, ElementRef, QueryList, Renderer2, ViewChildren } from '@angular/core';
import { Observable, fromEvent, interval, merge, throttle } from 'rxjs';

import {
  UtilService
} from '@app/services';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements AfterViewInit {

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

  constructor(
    private _utilService: UtilService,
    private _el: ElementRef,
    private _renderer: Renderer2
  ) {
    // NOTE: is loaded from another route
    // const isLoadedFromAnotherRoute = Boolean(this._router.getCurrentNavigation()?.previousNavigation);
  }

  ngAfterViewInit() {
    // NOTE: fix for zoom out - required for .viewport-height when dynamic (responsive)
    // first set to 100vh then change to same size in pixels

    // *** TOP SECTION ***
    const landingSection: HTMLElement = this._el.nativeElement.querySelector('.top-section');
    landingSection.style.maxHeight = landingSection.offsetHeight + 'px';
    landingSection.style.minHeight = landingSection.offsetHeight + 'px';

    // this.setBulletPointsHover();
    // this.bulletPointsHover$ = merge(
    //   this.bulletPoints.map(bullet => fromEvent(bullet.nativeElement, 'hover'))
    // );
  }


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

}
