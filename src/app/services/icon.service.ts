import { Injectable } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { MatIconRegistry } from "@angular/material/icon";

@Injectable({
  providedIn: 'root'
})
export class IconService {

  constructor(
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer
  ) { }

  Icons: { name: string }[] = [
    { name: 'planet' },
    { name: 'book' },
    { name: 'qoute' },
    { name: 'dog-happy' },
    { name: 'dog-head' },
    { name: 'home-page-category-food' }
  ]

  addCustomIcons() {
    this.Icons.forEach(icon => this.matIconRegistry.addSvgIcon(
      icon.name, 
      this.domSanitizer.bypassSecurityTrustResourceUrl(`../../assets/icons/${icon.name}.svg`)
    ))
  }
}
