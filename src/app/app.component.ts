import { Component, OnInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { SpinnerService } from '@app/services';

interface GridItem {
  text: string,
  cols: number,
  rows: number,
  color: string,
  isLoading?: boolean
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

  @ViewChild('InputForHeader') input: ElementRef;

  title = 'ng-java';

  headerText: string = "HEADER";

  initialGridItems: GridItem[] = [
    {text: 'One', cols: 3, rows: 1, color: 'lightblue'},
    {text: 'Two', cols: 1, rows: 2, color: 'lightgreen'},
    {text: 'Three', cols: 1, rows: 1, color: 'lightpink'},
    {text: 'Four', cols: 2, rows: 1, color: '#DDBDF1'},
  ];

  updatedGridItems: GridItem[] = [
    {text: 'One', cols: 3, rows: 1, color: 'lightblue'},
    {text: 'Three', cols: 1, rows: 1, color: 'lightpink'},
    {text: 'Four', cols: 2, rows: 1, color: '#DDBDF1'},
  ]

  gridItems: GridItem[] = this.initialGridItems;

  // spinner sub
  spinnerSub: Subscription;

  constructor(
    private spinnerService: SpinnerService
  ) {}

  ngOnInit(): void {
    this.spinnerSub = this.spinnerService.spinner$.subscribe(data => this.handleSpinner())
  }

  handleInputChange(): void {
    console.log('header text: ', this.input.nativeElement.value);
  }

  handleGridItemsUpdate(message: string): void {
    if (this.gridItems.length === 3) {
      this.gridItems = this.initialGridItems;
    } else {
      this.gridItems = this.updatedGridItems;
    }
  }

  handleSpinner() {
    this.gridItems = this.gridItems.map((el, i) => {
      const fakeLoadTime = Math.random() * 5;
      console.log('fake load time: ', fakeLoadTime);
      setTimeout(() => {
        console.log('fired');
        this.gridItems[i].isLoading = false;
      }, fakeLoadTime * 1000);

      return {
        ...el,
        isLoading: true
      }
    })


  }

  ngOnDestroy(): void {
    this.spinnerSub.unsubscribe();
  }
}
