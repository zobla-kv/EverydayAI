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
    { name: 'digital-product' },
    { name: 'instagram' },
    { name: 'dog-head'},
    { name: 'networking'},
    { name: 'planet' }, // can be removed after hp refactor
    { name: 'book' }, // same
    { name: 'dog-happy' }, // same
    { name: 'dollar' },
    { name: 'cart-add' },
    { name: 'cart-remove' },
    { name: 'dog-enthusiast' },
    { name: 'art' }, // same
    { name: 'graphic-designer' }, // same
    { name: 'visa' },
    { name: 'american-express' }, // recheck during payment
    { name: 'image-resolution' },
    { name: 'file-type-img' },
    { name: 'tier-classic' },
    { name: 'tier-premium' }
  ]

  // PRODUCTION: after deploy probably path will probably be just assets/icons/${icon.name}.svg
  addCustomIcons() {
    this.Icons.forEach(icon => this._matIconRegistry.addSvgIcon(
      icon.name,
      this._domSanitizer.bypassSecurityTrustResourceUrl(`../../assets/icons/${icon.name}.svg`)
    ))
  }
}
