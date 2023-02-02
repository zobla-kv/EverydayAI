import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import {  Subscription } from 'rxjs';

import { 
  FormType
} from '@app/models';

import {
  AuthService,
  HeaderEventsService 
} from '@app/services';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class FormComponent implements OnInit, AfterViewInit, OnDestroy {

  static ERROR_EMAIL_ALREADY_USED = 'email_already_used';
  static ERROR_MSG_EMAIL_ALREADY_USED = 'The email address is already in use by another account';

  // slider ref
  @ViewChild('slider') slider: ElementRef;

  // form type
  type = this.router.url.split('/').pop();

  // auth buttons sub
  headerAuthButtonSub$: Subscription;

  // login form
  loginForm: FormGroup;

  // register form
  registerForm: FormGroup;

  // show spinner on submit button
  showSpinner = false;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private headerEventsService: HeaderEventsService,
    private authService: AuthService
  ) {
    // from outside (header)
    this.headerAuthButtonSub$ =
      this.headerEventsService.authButton$.subscribe(type => this.handleTypeChange(type));
  }

  ngOnInit(): void {
    // TODO: add regex validator for non alphabetic characters
    this.registerForm = new FormGroup({
      'name': new FormControl(null, [Validators.required, Validators.minLength(6), Validators.maxLength(16)]),
      'email': new FormControl(null, [Validators.required, Validators.email]),
      'password': new FormControl(null, [Validators.required, Validators.minLength(6), Validators.maxLength(16)]),
      'gender': new FormControl(null, Validators.required),
    });

  }

  ngAfterViewInit(): void {
    // display right form when coming from outside route (w/o animation)
    this.displayProperForm();
  }

  // show proper side of the form
  displayProperForm() {
    const isLoginForm = this.type === FormType.LOGIN ? 0 : 1
    this.slider.nativeElement.checked = isLoginForm;
  }

  // handle change of form type
  handleTypeChange(type: string) {
    this.type = type;
    this.router.navigate([type], { relativeTo: this.activatedRoute });
    this.displayProperForm();
    // setTimeout(() => this[`${type}form`].reset(), 200);
  }

  // handle slider value change
  handleSliderUpdate(event: Event) {
    const typeFromEvent = (event.target as HTMLInputElement).checked ? FormType.REGISTER : FormType.LOGIN;
    this.handleTypeChange(typeFromEvent);
  }

  // submit form
  async submitForm() {
    this.showSpinner = true;
    const response = await this.authService.register(this.registerForm.getRawValue());
    console.log('response: ', response);
    if (response.error) {
      this.registerForm.controls['email'].setErrors({ [response.error]: response.errorMessage })
    }
    this.showSpinner = false;
    setTimeout(() => console.clear(), 0);
  }

  // validate form before submitting
  validateForm() {
    if (this.registerForm.valid) {
      this.submitForm();
    } else {
      this.validateAllFormFields(this.registerForm);
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

  ngOnDestroy(): void {
    this.headerAuthButtonSub$.unsubscribe();
  }
}
