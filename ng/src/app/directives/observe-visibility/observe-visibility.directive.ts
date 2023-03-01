import { AfterViewInit, Directive, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject, delay, filter } from 'rxjs';

@Directive({
  selector: '[observeVisibility]',
})
export class ObserveVisibilityDirective implements OnDestroy, OnInit, AfterViewInit {
  @Input() debounceTime = 0;
  @Input() threshold = 1;

  @Output() visible = new EventEmitter<HTMLElement>();

  private observer: IntersectionObserver | null;
  private subject$ = new Subject<{
    entry: IntersectionObserverEntry;
    observer: IntersectionObserver;
  }>();

  constructor(private element: ElementRef) {}

  ngOnInit() {
    console.log('construct: ', this.threshold);
    const options = {
      rootMargin: '0px',
      threshold: this.threshold,
    };

    this.observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        // console.log('entry: ', entry);
        if (entry.isIntersecting || entry.intersectionRatio > 0) {
          this.subject$.next({ entry, observer });
        }
      });
    }, options);
  }

  ngAfterViewInit() {
    if (!this.observer) {
      return;
    }

    this.observer.observe(this.element.nativeElement);

    console.log('started observing')

    this.subject$
      .pipe(delay(this.debounceTime), filter(Boolean))
      .subscribe(async ({ entry, observer }) => {
        console.log('entry: ', entry);
        const target = entry.target as HTMLElement;
        this.visible.emit(target);
        // cancel after firing once
        // observer.unobserve(target);
      });
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.subject$.complete();
  }

}
