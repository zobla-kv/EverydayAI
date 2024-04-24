import { AfterViewInit, Directive, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, Renderer2 } from '@angular/core';
import { animate, AnimationBuilder, AnimationPlayer, style } from '@angular/animations';
import { Subject, Subscription, first } from 'rxjs';

import {
  UtilService
} from '@app/services';

/**
 * Observe visibility directive
 * run animation once element is in view
 */
@Directive({
  selector: '[appear]'
})
export class ObserveVisibilityDirective implements OnDestroy, OnInit, AfterViewInit {

  // object holding hide styles
  @Input('hide') hideStyles: any = { 'opacity': '0' };
  // object holding show styles
  @Input('show') showStyles: any = { 'opacity': '1' };
  // show animation duration
  @Input() duration: number = 500;
  // show animation delay
  @Input() delay: number = 0;
  // show animation easing
  @Input() easing: '' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' = '';
  // what percentage should be visible before triggering
  @Input() threshold: number = 0.6;
  // root margin
  @Input() rootMargin: string = '0px';
  // add css class - if this is present element is not hidden and shown by directive
  // added class is responsible for that
  @Input() addClass: string = '';
  // run on mobile - disabled by default
  @Input() runOnMobile = false;
  // appear after user loded
  @Input() appearAfterUser = false;

  // emit event when element enters viewport
  @Output() intersection = new EventEmitter<ElementRef>();

  // is first visit
  isFirstVisit = this._utilService.isFirstVisit();

  // animation (hide -> show)
  animation: AnimationPlayer;

  // intersection observer
  private _observer: IntersectionObserver | null;

  // intersection trigger
  private _intersect$ = new Subject<void>();

  // subscibe to screen size change
  screenSizeChangeSub$: Subscription;

  // screen size
  screenSize: string;

  // mobile screen size
  mobileScreenSize = 'xs';

  constructor(
    private _element: ElementRef,
    private _renderer: Renderer2,
    private _builder: AnimationBuilder,
    private _utilService: UtilService
  ) {
    this.screenSizeChangeSub$ = this._utilService.screenSizeChange$.subscribe(size => this.screenSize = size);
  }

  ngOnInit() {
    // prevent run on mobile
    if (this.screenSize === this.mobileScreenSize && !this.runOnMobile) {
      return;
    }
    // hide element initially
    this.setHideStyles();
    this.createObserver();
    this.createAnimation();
    this.startObserving();
  }

  // start observing
  startObserving() {
    if (!this.isFirstVisit && !this.appearAfterUser) {
      this._observer?.observe(this._element.nativeElement);
      return;
    }

    this._utilService.appLoaded$.pipe(first()).subscribe(() => {
      this._observer?.observe(this._element.nativeElement);
    })
  }

  ngAfterViewInit() {
    this._intersect$.subscribe(() => {
      const target = this._element.nativeElement;
      this.addClass ? this._renderer.addClass(target, this.addClass) : this.animation.play();
      this.intersection.emit(this._element.nativeElement);
      // cancel after firing once
      this._observer?.unobserve(target);
    });
  }


  // hide element (should be reverse of show)
  setHideStyles() {
    if (this.addClass) {
      return;
    }
    for (const style of Object.keys(this.hideStyles)) {
      this._renderer.setStyle(this._element.nativeElement, style, this.hideStyles[style])
    }
  }

  // create animation and set variable
  createAnimation() {
    const factory = this._builder.build([animate(`${this.duration}ms ${this.delay}ms ${this.easing}`.trim(), style(this.showStyles))]);
    this.animation = factory.create(this._element.nativeElement);
  }

  createObserver() {
    const options = {
      // root: new Document(),
      root: null,
      rootMargin: this.rootMargin,
      threshold: this.threshold,
    };

    this._observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio >= this.threshold) {
          this._intersect$.next();
        }
      });
    }, options);
  }

  ngOnDestroy() {
    if (this._observer) {
      this._observer.disconnect();
      this._observer = null;
    }
    this._intersect$.complete();

    this.screenSizeChangeSub$ && this.screenSizeChangeSub$.unsubscribe();
  }

}
