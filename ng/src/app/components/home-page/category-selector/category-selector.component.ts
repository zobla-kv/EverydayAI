import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';

@Component({
  selector: 'app-category-selector',
  templateUrl: './category-selector.component.html',
  styleUrls: ['./category-selector.component.scss'],
  // svg inside mat-icon does not have css selector for encapsulation added
  encapsulation: ViewEncapsulation.None
})
export class CategorySelectorComponent implements OnInit {

  // main text inside box
  @Input() text: string = '';

  // icon 
  @Input() icon: string = '';

  constructor() {}

  ngOnInit(): void {
  }

}
