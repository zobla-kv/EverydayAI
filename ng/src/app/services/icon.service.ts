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
    { name: 'cart-add' },
    { name: 'cart-remove' },
    { name: 'digital-product' },
    { name: 'dollar' },
    { name: 'tier-classic' },
    { name: 'tier-premium' },
    { name: 'double-arrow-left' },
    { name: 'double-arrow-right' },

    // used by old home page component
    // { name: 'email' },
    // { name: 'instagram' }
  ]

  // name property needs to match file name
  gradientIcons: { name: string }[] = [
    // used by old home page component
    // { name: 'everyday-life' },
    // { name: 'mona-lisa' },
    // { name: 'expectance' },
    // { name: 'photos' },
    // { name: 'confetti' },
    // { name: 'discussion' },
    // { name: 'collaboration' },
    // { name: 'lightbulb' }, // TODO: unused
    // **

    { name: 'payment' },
    { name: 'image-resolution' },
    { name: 'file-type-img' },
    { name: 'click' },
    { name: 'write' }
  ]

  // PRODUCTION: after deploy probably path will probably be just assets/icons/${icon.name}.svg
  addCustomIcons() {
    // clasic
    this.Icons.forEach(icon => this._matIconRegistry.addSvgIcon(
      icon.name,
      this._domSanitizer.bypassSecurityTrustResourceUrl(`../../assets/icons/${icon.name}.svg`)
    ));

    // gradient
    this.gradientIcons.forEach(icon => this._matIconRegistry.addSvgIcon(
      icon.name,
      this._domSanitizer.bypassSecurityTrustResourceUrl(`../../assets/icons/gradient/${icon.name}.svg`)
    ))
  }
}
