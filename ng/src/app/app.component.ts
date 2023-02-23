import { Component, OnInit } from '@angular/core';

import { IconService } from '@app/services';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  title = 'house-of-dogs';

  constructor(
    private _iconService: IconService
  ) {
    this._iconService.addCustomIcons();
    !sessionStorage.getItem('isNewBrowserSession') && sessionStorage.setItem('isNewBrowserSession', 'true');
  }

  ngOnInit(): void {
  }
}
