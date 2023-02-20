import { Component, OnInit } from '@angular/core';

import { getAuth, checkActionCode, applyActionCode } from '@angular/fire/auth';

import {
  UtilService
} from '@app/services';

/**
 * Used to display informational message on empty route
 * message is derived from route params
 *
 */
@Component({
  selector: 'app-information',
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.scss']
})
export class InformationComponent implements OnInit {

  message: string = 'DEFAULT MESSAGE';

  // **** for firebase functionality (email verification etc.) **** //
  isLoading: boolean = false;
  mode: string | null = null;
  // ************************************************************* //

  constructor(
    private _utilService: UtilService
  ) {}

  // TODO: block /verify route
  ngOnInit(): void {
    const message = window.history.state.message;
    message && (this.message = message);

    this.mode = this._utilService.getParamFromUrl('mode');
    if (this.mode) {
      this.handleVerifyEmail();
    }
  }

  // TODO: handle code expired
  // Firebase: The action code has expired. (auth/expired-action-code) <- response.
  handleVerifyEmail() {
    this.isLoading = true;
    const auth = getAuth();
    const actionCode = this._utilService.getParamFromUrl('code') as string;
    applyActionCode(auth, actionCode)
    .then(res => {
      console.log('email verifiedede: ', res);
      this.message = 'Email verified successfuly'
      // Email address has been verified.

      // TODO: Display a confirmation message to the user.
      // You could also provide the user with a link back to the app.

      // TODO: If a continue URL is available, display a button which on
      // click redirects the user back to the app via continueUrl with
      // additional state determined from that URL's parameters.
    })
    .catch(err => {
        this.message = err.message;
    })
    .finally(() => this.isLoading = false);
  }
}
