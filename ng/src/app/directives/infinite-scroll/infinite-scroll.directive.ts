import { Directive, ElementRef, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { debounceTime, fromEvent, tap } from 'rxjs';

// NOTE: listens to scroll event on window, not on host element
@Directive({
  selector: '[infinite-scroll]'
})
export class InfiniteScrollDirective implements OnInit {

  @Output() scrolled: EventEmitter<void> = new EventEmitter<void>();

  // threshold in PX when to emit before scroll reaches page end
  @Input() threshold = 120;

  // previous Y position - for calculating scroll direction
  private _prevY = 0;

  // scroll direction
  private _direction: 'up' | 'down';

  private _window!: Window;

  constructor(private el: ElementRef) {
    fromEvent(window, 'scroll')
    .pipe(
      tap(() => this.setScrollDirection()),
      // don't throttle, it causes bug
      // throttleTime(300),
      debounceTime(100)
    )
    .subscribe(() => this.handleScroll());
  }

  ngOnInit(): void {
    // save window object for type safety
    this._window = window;
  }

  handleScroll() {
    // only if scrolled down
    if (this._direction === 'up') {
      return;
    }

    // height of whole window page
    const heightOfWholePage = this._window.document.documentElement.scrollHeight;

    // how big in pixels the element is
    const heightOfElement = this.el.nativeElement.scrollHeight;

    // currently scrolled Y position
    const currentScrolledY = this._window.scrollY;

    // height of opened window - shrinks if console is opened
    const innerHeight = this._window.innerHeight;

    // the area between the start of the page and when this element is visible in the parent component
    const spaceOfElementAndPage = heightOfWholePage - heightOfElement;

    // calculated whether we are near the end
    const scrollToBottom =
      heightOfElement - innerHeight - currentScrolledY + spaceOfElementAndPage;

    // if the user is near end
    if (scrollToBottom < this.threshold) {
      this.scrolled.emit();
    }
  }

  // set scroll direction
  setScrollDirection(): void {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    if (scrollY > this._prevY) {
      this._direction = 'down'
    } else if (scrollY < this._prevY) {
      this._direction = 'up';
    }
    this._prevY = scrollY;
  }

}
