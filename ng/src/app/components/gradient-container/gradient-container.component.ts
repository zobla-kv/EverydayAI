import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-gradient-container',
  templateUrl: './gradient-container.component.html',
  styleUrls: ['./gradient-container.component.scss']
})
export class GradientContainerComponent {

  // basic - border only, transparent - same but no bg, colored - gradient bg
  @Input() variant: 'basic' | 'transparent' | 'colored' = 'basic';
  // padding
  @Input() padding: string = '1rem';

}
