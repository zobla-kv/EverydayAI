import { AfterViewInit, Directive, ElementRef, Input, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { animate, AnimationBuilder, AnimationPlayer, style } from '@angular/animations';
import { Subject, delay, filter } from 'rxjs';

// TODO: clear unused variables
/**
 * Observe visibility directive
 * run animation once element is in view
 * for now used only to show (animate) element once in view - once 
 */
@Directive({
  selector: '[appear]'
})
export class ObserveVisibilityDirective implements OnDestroy, OnInit, AfterViewInit {
  @Input() debounceTime = 0;
  @Input() threshold = 0;

  // object holding hide styles
  // TODO: create model
  @Input() hideStyles = { 'opacity': '0', 'transform': 'translateY(20px)', 'filter': 'blur(20px)' };
  // object holding show styles 
  @Input() showStyles = { 'opacity': '1', 'transform': 'translateY(0px)' };

  // animation (hide -> show)
  animation: AnimationPlayer;

  private observer: IntersectionObserver | null;
  private subject$ = new Subject<void>();

  constructor(
    private _element: ElementRef,
    private _renderer: Renderer2,
    private builder: AnimationBuilder
  ) {}

  ngOnInit() {
    // hide element initially
    this.setHideStyles(this.hideStyles);

    this.createObserver();
    this.createAnimation();
  }

  ngAfterViewInit() {
    if (!this.observer) {
      return;
    }

    this.observer.observe(this._element.nativeElement);

    this.subject$
      // .pipe(delay(this.debounceTime), filter(Boolean))
      .subscribe(async () => {
        const target = this._element.nativeElement;
        this.animation.play();
        // cancel after firing once
        this.observer?.unobserve(target);   
      });
  }


  setHideStyles(styles: any) {
    for (const style of Object.keys(styles)) {
      this._renderer.setStyle(this._element.nativeElement, style, styles[style])
    }
  }

  // create animation and set variable
  // TODO: make this dynamic through input
  createAnimation() {
    const factory = this.builder.build([
      animate('500ms 0ms', style({
        'opacity': '1',
        'transform': 'translateY(0px)',
        'filter': 'blur(0)'
      }))
    ]);
    this.animation = factory.create(this._element.nativeElement);
  }

  createObserver() {
    const options = {
      // root: new Document(),
      root: null,
      rootMargin: '0px',
      threshold: this.threshold,
    };

    this.observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio >= this.threshold) {
          this.subject$.next();
        }
      });
    }, options);
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.subject$.complete();
  }

}

// rootMargin understand: https://cloud.netlifyusercontent.com/assets/344dbf88-fdf9-42bb-adb4-46f01eedd629/769b2733-5700-4d2d-a32f-6850a173abaa/1-dynamic-header-intersection-observer.png

// Input animation into directive, saved for later reference!!!

// @Directive({
//   selector: '[zetFadeInOut]',
// })
// export class FadeInOutDirective {

//   @Input()
//   set show(show: boolean) {
//     const metadata = show ? this.fadeIn() : this.fadeOut();

//     const factory = this.builder.build(metadata);
//     const player = factory.create(this.el.nativeElement);

//     player.play();
//   }

//   constructor(private builder: AnimationBuilder, private el: ElementRef) {}

//   private fadeIn(): AnimationMetadata[] {
//     return [
//       style({ opacity: 0 }),
//       animate('400ms ease-in', style({ opacity: 1 })),
//     ];
//   }

//   private fadeOut(): AnimationMetadata[] {
//     return [
//       style({ opacity: '*' }),
//       animate('400ms ease-in', style({ opacity: 0 })),
//     ];
//   }
// }
