import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';

import { Subscription } from 'rxjs';

import {
  Form,
  FormType,
  FirebaseError,
  FirebaseConstants
} from '@app/models';

import {
  AuthService,
  ToastService,
  UtilService
} from '@app/services';

/**
 * Only for reg/login forms
 */
@Component({
  selector: 'app-auth-form',
  templateUrl: './auth-form.component.html',
  styleUrls: ['./auth-form.component.scss']
})
export class AuthFormComponent implements OnInit, AfterViewInit, OnDestroy {

  // slider ref
  @ViewChild('slider') slider: ElementRef;

  // currently active form
  activeForm: Form = { form: new FormGroup({}), type: this._router.url.split('/').pop() };

  // auth buttons sub
  headerAuthButtonSub$: Subscription;

  // register form
  registerForm: Form;

  // login form
  loginForm: Form;

  // show spinner on submit button
  showSpinner = false;

  // show/hide password
  showPassword = false;

  constructor(
    private _router: Router,
    private _utilService: UtilService,
    private _authService: AuthService,
    private _toast: ToastService,
    private _titlService: Title
  ) {
    // from outside (header)
    this.headerAuthButtonSub$ =
      this._utilService.authButtonClick$.subscribe(type => this.handleTypeChange(type));
  }

  ngOnInit(): void {
    // TODO: add confirm password field, also when resetting password
    this.registerForm = {
      form: new FormGroup({
        'name': new FormControl(null, [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(16),
          Validators.pattern('^[a-zA-Z_]+( [a-zA-Z_]+)*$')
        ]),
        'email': new FormControl(null, [Validators.required, Validators.email]),
        'password': new FormControl(null, [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(16),
          Validators.pattern('^[a-zA-Z0-9_]+( [a-zA-Z0-9_]+)*$')
        ]),
        'dob': new FormControl(null, Validators.required),
        'gender': new FormControl(null, Validators.required),
      }),
      type: FormType.REGISTER
    }

    this.loginForm = {
      form: new FormGroup({
        'email': new FormControl(null, [Validators.required, Validators.email]),
        'password': new FormControl(null, [Validators.required]),
      }),
      type: FormType.LOGIN
    }

    this.activeForm = this.activeForm.type === this.registerForm.type ? this.registerForm : this.loginForm;

  }

  ngAfterViewInit(): void {
    // display right form when coming from outside route (w/o animation)
    this.displayProperForm();
  }

  // show proper side of the form
  displayProperForm() {
    const isLoginForm = this.activeForm.type === FormType.LOGIN ? 0 : 1
    this.slider.nativeElement.checked = isLoginForm;
  }

  // handle change of form type
  handleTypeChange(type: string) {
    this.activeForm = type === FormType.LOGIN ? this.loginForm : this.registerForm;
    // just change url without realod, easiest way to keep same instance alive
    window.history.pushState(null, '', `auth/${this.activeForm.type}`);
    this.displayProperForm();
    this._titlService.setTitle(this._utilService.capitalizeText(this.activeForm.type!))
  }

  // handle slider value change
  handleSliderUpdate(event: Event) {
    const typeFromEvent = (event.target as HTMLInputElement).checked ? FormType.REGISTER : FormType.LOGIN;
    this.handleTypeChange(typeFromEvent);
  }

  // toggle show-hide password
  showHidePassword() {
    this.showPassword = !this.showPassword;
  }

  // handle date of birth change
  handleDateChange() {
    const dob = this.registerForm.form.get('dob')?.value;
    const age = this._utilService.getAge(dob);
    if (age < 18) {
      this.registerForm.form.controls['dob'].setErrors({ underAge: true });
    }
  }

  // submit form
  async submitForm(form: Form) {
    this.showSpinner = true;
    let response: FirebaseError | void;
    if (form.type === FormType.LOGIN) {
      response = await this._authService.login(form.form.getRawValue());
    } else {
      response = await this._authService.register(form.form.getRawValue());
    }
    // if it returns it has an error, otherwise is handled in auth service
    if (response) {
      this.showSpinner = false;
      return this.handleError(form.form, response);
    }
  }

  // handle error based on error type
  handleError(form: FormGroup, error: FirebaseError) {
    let controlName = '';
    switch(error.errorCode) {
      // in below case set error directly on form to avoid fields getting red
      // do not show what exactly is wrong (better security)
      case FirebaseConstants.LOGIN_USER_NOT_FOUND:
      case FirebaseConstants.LOGIN_WRONG_PASSWORD:
      case FirebaseConstants.LOGIN_INVALID_CREDENTIALS:
        return form.setErrors({
          [FirebaseConstants.LOGIN_WRONG_CREDENTIALS]: (FirebaseConstants.LOGIN_WRONG_CREDENTIALS)
        });
      case FirebaseConstants.REGISTRATION_EMAIL_ALREADY_USED:
      case FirebaseConstants.LOGIN_TOO_MANY_REQUESTS:
      case FirebaseConstants.LOGIN_EMAIL_NOT_VERIFIED:
        controlName = 'email'
        break;
      case FirebaseConstants.REGISTRATION_FAILED:
        return this._utilService.navigateToInformationComponent(error.errorMessage);
      default:
        return this._toast.showDefaultError();
    }
    form.controls[controlName].setErrors({ [error.errorCode]: error.errorMessage })
  }

  // validate form before submitting
  validateForm() {
    if (this.activeForm.form.valid) {
      this.submitForm(this.activeForm);
    } else {
      this.validateAllFormFields(this.activeForm.form);
    }
  }

  // TODO: move to util? (in 3 places now)
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

  ngOnDestroy(): void {
    this.headerAuthButtonSub$ && this.headerAuthButtonSub$.unsubscribe();
  }

}
