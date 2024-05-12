import { AfterViewInit, Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';

import { first } from 'rxjs';

import {
  FirebaseService
} from '@app/services';

import {
  ProductResponse
} from '@app/models';

// FAQ items
import FAQitems from './FAQ';

@Component({
  selector: 'app-home-page-new',
  templateUrl: './home-page-new.component.html',
  styleUrls: ['./home-page-new.component.scss']
})
export class HomePageNewComponent implements OnInit, AfterViewInit {
  // table of contents
  @ViewChild('toc') toc: ElementRef;
  // questionmark
  @ViewChild('questionmark') questionmark: ElementRef;

  // FAQ items
  FAQItems = FAQitems;

  // slider items
  slides: ProductResponse[];

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
  }

  constructor(
    private _firebaseService: FirebaseService,
    private _renderer: Renderer2,
    private _el: ElementRef
  ) {}

  // add css class once element is displayed to get eyes to focus on that
  highlightElement(element: any, delay: number = 1800) {
    setTimeout(() => {
      element.classList.add('highlighted');
    }, delay);
  }

  ngOnInit() {
    this.setSlider();
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

  // get images and set slider items
  async setSlider() {
    this._firebaseService.getProductsByMostLikes(20).pipe(first()).subscribe(products => {
      this.slides = this.removeTransparentImages(products);
      this.slides.push(...this.slides);
    })
  }

  // removes transparent images from slider
  removeTransparentImages(products: ProductResponse[]): ProductResponse[] {
    return products.filter(product => !product.description.includes('transparent'));
  }

  // get image orientation
  getImageOrientation(product: ProductResponse): 'portrait' | 'landscape' {
    const resolution = product.metadata['resolution'] as any;
    const width = Number(resolution.split('x')[0]);
    const height = Number(resolution.split('x')[1]);

    return width > height ? 'landscape' : 'portrait';
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

}
