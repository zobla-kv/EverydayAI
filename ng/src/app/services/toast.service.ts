import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

import {
  ToastComponent
} from '@app/components';

import {
  ToastMessages
} from '@app/models';

@Injectable({
  providedIn: 'root'
})
export class ToastService extends MatSnackBar {

  // open custom toast. - disabled
  override open(message: string, action?: string | undefined, config?: MatSnackBarConfig<any> | undefined): any {
    throw new Error('Trying to open toast with disabled method.');
    super.openFromComponent(ToastComponent, { data: { message, type: action }, ...config })
  }

  // show success message
  showSuccessMessage(message: string, config?: MatSnackBarConfig<any>) {
    const type = 'success';
    const panelClass = 'snackbar-success';
    super.openFromComponent(ToastComponent, { ...config, data: { message, type }, panelClass });
  }

  // shows error message
  showErrorMessage(message: string, config?: MatSnackBarConfig<any>) {
    const type = 'error';
    const panelClass = 'snackbar-error';
    super.openFromComponent(ToastComponent, { ...config, data: { message, type }, panelClass });
  }

  // close currently active toast.
  close() {
    super.dismiss();
  }

  // Shows 'Something went wrong. Please try again.' toast message.
  showDefaultError(): void {
    this.showErrorMessage(ToastMessages.SOMETHING_WENT_WRONG);
  }

}
