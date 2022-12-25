import { Directive, ElementRef, HostBinding, HostListener, Input, OnInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appHighlight]'
})
export class HighlightDirective implements OnInit {
  // assign alias with same name as directive - how [ngStyle] works for example
  @Input('appHighlight') defaultColor: string = 'red';
  @Input() highlightColor: string = 'blue';

  
  // bind to host property
  @HostBinding('style.backgroundColor') bgColor: string = this.defaultColor;

  // Renderer works outside of browser (service worksers etc.)
  constructor(private element: ElementRef, private renderer: Renderer2) { }
  
  ngOnInit(): void {
    // 4th param could be '!important'
    // this.renderer.setStyle(this.element.nativeElement, 'background-color', 'red');
  }

  // listenen to classic dom events on current element
  @HostListener('mouseenter') mouseon(eventData: Event) {
    // with Renderer
    // this.renderer.setStyle(this.element.nativeElement, 'background-color', 'red');

    // with HostBinding and Input
    this.bgColor = this.highlightColor;
  }

  @HostListener('mouseleave') mouseoff(eventData: Event) {
    // with Renderer
    // this.renderer.setStyle(this.element.nativeElement, 'background-color', 'blue');

    // with HostBinding and Input
    this.bgColor = this.defaultColor;
  }

}
