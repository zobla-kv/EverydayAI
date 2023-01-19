import { Component, OnInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';

import { IconService } from '@app/services';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  title = 'ng-java';

  constructor(
    private IconService: IconService 
  ) {
    this.IconService.addCustomIcons();
  }

  ngOnInit(): void {
  }
}
