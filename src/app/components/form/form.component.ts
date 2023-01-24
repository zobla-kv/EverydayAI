import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

import { FormType } from '@app/models';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class FormComponent implements AfterViewInit, OnDestroy {

  // slider ref
  @ViewChild('slider') slider: ElementRef;
  // update slider
  @ViewChild('updateSlider') updateSlider: ElementRef;

  // form type
  type = this.router.url.split('/').pop();

  // routing subscription
  routingSub$: Subscription;

  constructor(
    private router: Router,
    private location: Location
  ) {
    this.routingSub$ = this.router.events
    .pipe(filter(event => event instanceof NavigationStart))
    .subscribe((event: any) => this.handleRouteChange(event));
  }

  ngAfterViewInit(): void {
    // display right form when coming from outside route (w/o animation)
    const isLoginForm = this.type === FormType.LOGIN ? 0 : 1
    this.slider.nativeElement.checked = isLoginForm;
  }

  // display right form and route on slide
  handleSlider() {
    const isLoginForm = !this.slider.nativeElement.checked;
    this.type = isLoginForm ? FormType.REGISTER : FormType.LOGIN;
    // buggy because of fake route
    this.location.go('auth/' + this.type);
    // slow
    // this.router.navigate(['auth', this.type], { state: { avoidRecursion: true }});
  }

  // split between log/reg button functionality and leaving the page
  handleRouteChange(route: NavigationStart) {
    // TODO: careful if want to add auth/reset-password
    const isAuthRoute = route.url.includes('auth');
    if (isAuthRoute) {
      // log/reg func
      this.updateSlider.nativeElement.click(); 
    }
    // leave page
  }

  ngOnDestroy(): void {
    this.routingSub$.unsubscribe();
  }
}
