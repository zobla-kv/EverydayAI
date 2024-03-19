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
    { name: 'email' },
    { name: 'instagram' }
  ]

  // name property needs to match file name
  gradientIcons: { name: string }[] = [
    { name: 'everyday-life' },
    { name: 'mona-lisa' },
    { name: 'collaboration' }, // TODO: unused but really cool
    { name: 'expectance' },
    { name: 'lightbulb' }, // TODO: unused
    { name: 'confetti' }, // TODO: unused, usage place is commented out
    { name: 'payment' },
    { name: 'image-resolution' },
    { name: 'file-type-img' },
    { name: 'photos' },
    { name: 'discussion' }
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
