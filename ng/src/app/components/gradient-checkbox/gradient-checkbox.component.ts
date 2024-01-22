import { Component, Input } from '@angular/core';
import { ControlContainer, FormGroupDirective } from '@angular/forms';

@Component({
  selector: 'app-gradient-checkbox',
  templateUrl: './gradient-checkbox.component.html',
  styleUrls: ['./gradient-checkbox.component.scss'],
  viewProviders: [
    {
      provide: ControlContainer,
      useExisting: FormGroupDirective
    }
  ]
})
export class GradientCheckboxComponent {
  // form control
  @Input() control: any;
  // form control name
  @Input() controlName: string;
  // input type
  @Input() type: 'checkbox' | 'radio' = 'checkbox';
  // value
  @Input() value: string;

}
