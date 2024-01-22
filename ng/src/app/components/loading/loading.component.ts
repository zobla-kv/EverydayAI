import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss']
})
export class LoadingComponent implements OnInit {

  @Input() variant: 'gooey' | 'ellipsis' = 'gooey';

  ngOnInit(): void {
    if (!this.variant) {
      throw new Error('Variant not set');
    }
  }

}
