import { Component, OnInit } from '@angular/core';

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

  constructor() {}

  // TODO: block /verify route
  ngOnInit(): void {
    const message = window.history.state.message ;
    message && (this.message = message);
  }
}
