import { Component, EventEmitter, Input, Output } from '@angular/core';

import { SpinnerService } from '@app/services';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {

  @Input() currentText: string = 'nothing yet';
  @Output() updateGridItemsEvent = new EventEmitter<string>();

  constructor(private SpinnerService: SpinnerService) {}

  updateGridItems() {
    this.updateGridItemsEvent.emit('update initiated');
  }

  startSpinner() {
    this.SpinnerService.spinner$.next(true);
  }
}
