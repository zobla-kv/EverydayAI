import { Component } from '@angular/core';

import {
  SpinnerService
} from '@app/services';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {

  isLogged = false;

  constructor() {}

}
