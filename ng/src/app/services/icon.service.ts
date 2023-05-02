import { Injectable } from '@angular/core';
import { DomSanitizer } from "@angular/platform-browser";
import { MatIconRegistry } from "@angular/material/icon";

@Injectable({
  providedIn: 'root'
})
export class IconService {

  constructor(
    private _matIconRegistry: MatIconRegistry,
    private _domSanitizer: DomSanitizer
  ) { }

  // name property needs to match file name
  Icons: { name: string }[] = [
    { name: 'planet' },
    { name: 'book' },
    { name: 'qoute' },
    { name: 'dog-happy' },
    { name: 'dog-head' },
    { name: 'home-page-category-food' },
    { name: 'next-step' },
    { name: 'dollar' },
    { name: 'video' },
    { name: 'sweat-drops' },
    { name: 'cart-add' },
    { name: 'cart-remove' },
    { name: 'dog-enthusiast' },
    { name: 'courage' },
    { name: 'open-mind' }
  ]

  // TODO: after deploy probably path will probably be just assets/icons/${icon.name}.svg
  addCustomIcons() {
    this.Icons.forEach(icon => this._matIconRegistry.addSvgIcon(
      icon.name,
      this._domSanitizer.bypassSecurityTrustResourceUrl(`../../assets/icons/${icon.name}.svg`)
    ))
  }
}
