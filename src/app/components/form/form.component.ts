import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { distinctUntilChanged, Subscription } from 'rxjs';

import { FormType } from '@app/models';

import { HeaderEventsService } from '@app/services';


const VALID = 'VALID';
const INVALID = 'INVALID';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class FormComponent implements OnInit, AfterViewInit, OnDestroy {

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

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private headerEventsService: HeaderEventsService
  ) {
    // from outside (header)
    this.headerAuthButtonSub$ =
      this.headerEventsService.authButton$.subscribe(type => this.handleTypeChange(type));
  }

  ngOnInit(): void {
    this.registerForm = new FormGroup({
      'name': new FormControl(null, Validators.required),
      'email': new FormControl(null, [Validators.required, Validators.email]),
      'password': new FormControl(null, Validators.required),
      'gender': new FormControl(null, Validators.required),
    })

    Object.keys(this.registerForm.controls)
      .filter(field => field !== 'gender')
      .forEach(field => {
        this.registerForm.get(field)?.statusChanges
        .pipe(distinctUntilChanged())
        .subscribe(status => this.handleStatusChange(field, status));
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
  }

  // handle slider value change
  handleSliderUpdate(event: Event) {
    const typeFromEvent = (event.target as HTMLInputElement).checked ? FormType.REGISTER : FormType.LOGIN;
    this.handleTypeChange(typeFromEvent);
  }

  getPlaceholder(field: string) {
    // if (!this.registerForm.get(field)?.valid && this.registerForm.get(field)?.touched) {
    //   return 'invalid';
    // }
    return 'your name'
  }

  // handle status change of form field (valid <=> invalid)
  handleStatusChange(field: string, status: string) {
    if (status === INVALID) {
      console.log('fired');
      this.registerForm.patchValue({ field: 'invalid kek' });
    }
  }

  handleRegisterSubmit() {
    console.log('cl: ', this.registerForm);
  }

  ngOnDestroy(): void {
    this.headerAuthButtonSub$.unsubscribe();
  }
}
