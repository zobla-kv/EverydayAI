import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';

import { FormType } from '@app/models';

import { HeaderEventsService } from '@app/services';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class FormComponent implements AfterViewInit, OnDestroy {

  // slider ref
  @ViewChild('slider') slider: ElementRef;

  // form type
  type = this.router.url.split('/').pop();

  // auth buttons sub
  headerAuthButtonSub$: Subscription;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private headerEventsService: HeaderEventsService
  ) {
    // from outside (header)
    this.headerAuthButtonSub$ =
      this.headerEventsService.authButton$.subscribe(type => this.handleTypeChange(type));
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

  ngOnDestroy(): void {
    this.headerAuthButtonSub$.unsubscribe();
  }
}
