import { Component, HostListener } from '@angular/core';

import animations from './footer.animations';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  animations
})
export class FooterComponent {

  @HostListener('window:scroll', ['$event']) 
  onScroll(event: any) {
    // check if user reached bottom of the page then show footer
    if (window.innerHeight + window.pageYOffset >= document.body.offsetHeight - 10) {
      !this.show && this.showFooter();
    } else {
      this.show && this.hideFooter();
    }
  }

  // did user scroll to the bottom of the page
  show = false;

  // trigger footer show animation
  showFooter() {
    this.show = true;
  }

  // trigger footer hide animation
  hideFooter() {
    this.show = false;
  }

}
