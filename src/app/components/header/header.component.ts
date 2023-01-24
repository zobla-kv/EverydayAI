import { Component } from '@angular/core';
import { Router } from '@angular/router';

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

  constructor(
    private router: Router
  ) {}

  handleLoginButton() {
    this.router.navigate(['auth', 'login']);
  }

  handleRegisterButton() {
    this.router.navigate(['auth', 'register']);
  }

}
