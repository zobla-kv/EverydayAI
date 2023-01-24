import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, DetachedRouteHandle, Router, RouteReuseStrategy } from '@angular/router';

import { FormType } from '@app/models';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class FormComponent extends RouteReuseStrategy implements OnInit, AfterViewInit {

  // slider ref
  @ViewChild('slider') slider: ElementRef;
  
  // form type
  type = FormType.LOGIN;

  // current route that will determin slider value and form displayed
  currentRoute: string = this.router.url;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    super();
    console.log('rerender')
  }

  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    console.log('route isnide: ', route);
    // const keepOnRoutes = ['/login', '/register'];
    return false;
  }
  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle | null): void {
    throw new Error('Method not implemented.');
  }
  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    throw new Error('Method not implemented.');
  }
  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    throw new Error('Method not implemented.');
  }
  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    return true;
  }

  ngOnInit(): void {
    // set slider value
    // this.slider.nativeElement.checked = this.currentRoute === '/' + FormType.LOGIN ? 0 : 1;
  }

  ngAfterViewInit() {
    // if route matches current form
    if (this.currentRoute === '/' + this.type) {
    } else {
      this.slider.nativeElement.click();
    }
    // this.slider.nativeElement.checked = this.currentRoute === '/' + FormType.LOGIN ? 0 : 1;
  }

  // switch between forms
  handleFormChange(ev: any) {
    const isChecked = ev.target.checked;
    const currentForm = this.type;
    const futureForm = currentForm === FormType.LOGIN ? FormType.REGISTER : FormType.LOGIN;
  }

  ngOnDestroy() {
    // this.shouldDetach(new ActivatedRouteSnapshot());
  }
}
