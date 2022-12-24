import { Component, ElementRef, ViewChild } from '@angular/core';

import {
  HeaderComponent,
  FooterComponent
} from '@app/components';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  
  @ViewChild('InputForHeader') input: ElementRef; 

  title = 'ng-java';

  headerText: string = "Controlled header";

  handleInputChange(): void {
    console.log('header text: ', this.input.nativeElement.value);
  }
}
