import { AfterViewInit, Directive, ElementRef, EventEmitter, Input, Output } from '@angular/core';
import { fromEvent } from 'rxjs';

// Directive for getting active section (by scroll position) inside host element

@Directive({
  selector: '[scrollSpy]',
  hostDirectives: []
})
export class ScrollSpyDirective implements AfterViewInit {

  // NOTE: hardcoded to section tag
  @Input()  spiedTags: string[] = ['SECTION'];
  @Output() sectionChange = new EventEmitter<string>();

  private _currentSection: string;

  // html elements
  spiedSections: HTMLCollection;

  constructor(
    private _el: ElementRef
  ) {
    // TODO: for current use case, this only needs to be handled on large screen
    fromEvent(window, 'scroll')
    .subscribe(() => this.handleScroll());
  }

  ngAfterViewInit() {
    this.spiedSections = (this._el.nativeElement as HTMLElement).getElementsByTagName('section');
  }

  handleScroll() {
    for (let i = 0; i < this.spiedSections.length; i++) {
      const element = this.spiedSections[i] as HTMLElement;
      const elementTop = element.getBoundingClientRect().y;
      if (elementTop < 350 && elementTop > -100 && this._currentSection !== element.id) {
        this._currentSection = element.id;
        this.sectionChange.emit(this._currentSection);
      }
    }
  }

}
