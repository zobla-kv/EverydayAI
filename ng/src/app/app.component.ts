import { Component, OnInit } from '@angular/core';

import { IconService } from '@app/services';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  title = 'ng-java';

  constructor(
    private _iconService: IconService
  ) {
    this._iconService.addCustomIcons();
  }

  ngOnInit(): void {
  }
}
