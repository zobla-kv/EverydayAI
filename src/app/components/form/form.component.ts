import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import {  Subscription } from 'rxjs';

import {
  Form,
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

  // slider ref
  @ViewChild('slider') slider: ElementRef;

  // currently active form
  activeForm: Form = { form: new FormGroup({}), type: this.router.url.split('/').pop() };

  // auth buttons sub
  headerAuthButtonSub$: Subscription;

  // register form
  registerForm: Form;

  // login form
  loginForm: Form;

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
    this.registerForm = {
      form: new FormGroup({
        'name': new FormControl(null, [Validators.required, Validators.minLength(6), Validators.maxLength(16)]),
        'email': new FormControl(null, [Validators.required, Validators.email]),
        'password': new FormControl(null, [Validators.required, Validators.minLength(6), Validators.maxLength(16)]),
        'gender': new FormControl(null, Validators.required),
      }),
      type: FormType.REGISTER
    }

    this.loginForm = {
      form: new FormGroup({}),
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
    this.router.navigate([this.activeForm.type], { relativeTo: this.activatedRoute });
    this.displayProperForm();
    // setTimeout(() => this.activeForm.form.reset(), 200);
  }

  // handle slider value change
  handleSliderUpdate(event: Event) {
    const typeFromEvent = (event.target as HTMLInputElement).checked ? FormType.REGISTER : FormType.LOGIN;
    this.handleTypeChange(typeFromEvent);
  }

  // submit form
  async submitForm(form: Form) {
    this.showSpinner = true;
    let response;
    if (form.type === FormType.LOGIN) {
      this.authService.login();
    } else {
      response = await this.authService.register(form.form.getRawValue());
    }
    if (response?.error) {
      this.showSpinner = false;
      // setTimeout(() => console.clear(), 0);
      return this.registerForm.form.controls['email'].setErrors({ [response.error]: response.errorMessage });
    }
    this.router.navigate(['/']);
  }

  // validate form before submitting
  validateForm() {
    if (this.activeForm.form.valid) {
      this.submitForm(this.activeForm);
    } else {
      this.validateAllFormFields(this.activeForm.form);
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
