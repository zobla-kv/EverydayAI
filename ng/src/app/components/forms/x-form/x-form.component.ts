import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import {
  FirebaseError,
} from '@app/models';

import {
  FirebaseService
} from '@app/services';

/**
 * Update name to something else
 * this shall use mutliple forms
 * contains copy paste code from form component
 */
@Component({
  selector: 'app-x-form',
  templateUrl: './x-form.component.html',
  styleUrls: ['./x-form.component.scss']
})
export class XFormComponent {

  // phase
  phase: number;
  
  form: FormGroup;

  showSpinner = false;

  // show/hide password
  showPassword = false;

  constructor(
    private _firebaseService: FirebaseService
  ) {}

  ngOnInit(): void {  
    this.phase = window.history.state.phase;
    // if it is phase 2 it is password update 
    // if not then it is email to which to send link
    this.form = new FormGroup(
      this.phase === 2 ? 
      {
        'password': new FormControl(null, [
          Validators.required, 
          Validators.minLength(6),
          Validators.maxLength(16),
          Validators.pattern('^[a-zA-Z0-9]*$')
        ])
      } : 
      {
        'email': new FormControl(null, [Validators.required, Validators.email])
      }
    )
  }

  // toggle show-hide password
  showHidePassword() {
    this.showPassword = !this.showPassword;
  }

  // submit form
  async submitForm(form: FormGroup) {
    this.showSpinner = true;
    let response;
    if (this.phase === 2) {
      const code = window.history.state.code;
      this._firebaseService.updatePassword(code, this.form.get('password')?.value);
    } else {
      response = await this._firebaseService.sendPasswordResetEmail(this.form.get('email')?.value);
    }
    // if it returns it has an error, otherwise is handled in firebase service
    if (response) {
      // TODO: uncomment for prod
      // setTimeout(() => console.clear(), 0);
      this.showSpinner = false;
      return this.handleError(form, response);
    }
  }

  // handle error based on error type
  // only error is that user is not found
  handleError(form: FormGroup, error: FirebaseError) {
    form.controls['email'].setErrors({ [error.errorCode]: error.errorMessage })
  }

  // validate form before submitting
  validateForm() {
    if (this.form.valid) {
      this.submitForm(this.form);
    } else {
      this.validateAllFormFields(this.form);
    }
  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }
  
}
