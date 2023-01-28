import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

import {
  HeaderEventsService
} from '@app/services';

import { FormType } from '@app/models';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {

  isLogged = false;

  constructor(
    private router: Router,
    private headerEventsService: HeaderEventsService
  ) {}

  // handle route change to log/reg form
  handleAuthButton(type: string) {
    const prevRoute = this.router.url;
    if (prevRoute.includes('auth')) {
      // switch between forms when already on that route
      this.headerEventsService.fireAuthButtonClicked(type);
    } else {
      this.router.navigate(['auth', type]);
    }
  }

}
