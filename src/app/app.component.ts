import { Component, OnInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { DomSanitizer } from "@angular/platform-browser";

import { MatIconRegistry } from "@angular/material/icon";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  title = 'ng-java';

  constructor(
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer
  ) {
    this.matIconRegistry.addSvgIcon(
      'dog-category-food-icon', 
      this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/icons/dog-food-category-icon.svg')
    );
    this.matIconRegistry.addSvgIcon(
      'home-page-category-food', 
      this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/icons/home-page-category-food.svg')
    );
  }

  ngOnInit(): void {
  }
}
