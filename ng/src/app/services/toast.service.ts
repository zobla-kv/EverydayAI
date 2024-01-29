import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

import {
  ToastComponent
} from '@app/components';

import {
  ToastConstants
} from '@app/models';

@Injectable({
  providedIn: 'root'
})
export class ToastService extends MatSnackBar {

  // open custom toast.
  override open(message: string, action?: string | undefined, config?: MatSnackBarConfig<any> | undefined): any {
    const panelClass = action == ToastConstants.TYPE.SUCCESS.type ? 
      ToastConstants.TYPE.SUCCESS.cssClass : 
      ToastConstants.TYPE.ERROR.cssClass;
    super.openFromComponent(ToastComponent, { data: { message, type: action }, panelClass, ...config })
  }

  // close currently active toast.
  close() {
    super.dismiss();
  }

  // Shows 'Something went wrong. Please try again.' toast message.
  showDefaultError(): void {
    this.open(ToastConstants.MESSAGES.SOMETHING_WENT_WRONG, ToastConstants.TYPE.ERROR.type);
  }


}
