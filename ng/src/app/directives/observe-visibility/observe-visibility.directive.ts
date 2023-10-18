import { AfterViewInit, Directive, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, Renderer2 } from '@angular/core';
import { animate, AnimationBuilder, AnimationPlayer, style } from '@angular/animations';
import { Subject, first } from 'rxjs';

import {
  UtilService
} from '@app/services';

// TODO: clear unused variables
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
  @Input('duration') duration: number = 500;
  // show animation delay
  @Input('delay') delay: number = 0;
  // what percentage should be visible before triggering
  @Input('threshold') threshold: number = 0.6;
  // root margin
  @Input('rootMargin') rootMargin: string = '0px';
  // appear immediately (don't wait to be in view)
  @Input('appearImmediately') appearImmediately: boolean = false;

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

  constructor(
    private _element: ElementRef,
    private _renderer: Renderer2,
    private _builder: AnimationBuilder,
    private _utilService: UtilService
  ) {}

  ngOnInit() {
    // hide element initially
    this.setHideStyles();
    this.createObserver();
    this.createAnimation();
    this.startObserving();
  }

  // start observing
  startObserving() {
    if (this.appearImmediately) {
      this.animation.play();
      return;
    }

    if (!this.isFirstVisit) {
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
      // console.log('element visible: ', target);
      this.animation.play();
      this.intersection.emit(this._element.nativeElement);
      // cancel after firing once
      this._observer?.unobserve(target);
    });
  }


  // hide element (should be reverse of show)
  setHideStyles() {
    for (const style of Object.keys(this.hideStyles)) {
      this._renderer.setStyle(this._element.nativeElement, style, this.hideStyles[style])
    }
  }

  // create animation and set variable
  createAnimation() {
    const factory = this._builder.build([animate(`${this.duration}ms ${this.delay}ms`, style(this.showStyles))]);
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
  }

}
