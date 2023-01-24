import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

import {
  SpinnerService
} from '@app/services';

import { FormType } from '@app/models';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {

  isLogged = false;

  authButton$ = new Subject<any>();

  constructor(
    private router: Router
  ) {}

  // handle route change to log/reg form
  handleAuthButton(type: string) {
    this.router.navigate(['auth', type])
  }

}
