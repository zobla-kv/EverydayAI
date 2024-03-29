import { Component, ElementRef, OnInit, Input, ViewEncapsulation, EventEmitter, Output, OnDestroy } from '@angular/core';
import { ModalService } from '@app/services';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ModalComponent implements OnInit, OnDestroy {

  // modal id
  @Input() id: string;
  // modal title
  @Input() title: string;
  // action button text
  @Input() actionButtonText: string;
  // hide footer?
  @Input() hideFooter = false;
  // product image orientation
  @Input() orientation: any;

  // confirm
  @Output() confirm = new EventEmitter<void>();
  // close
  @Output() close = new EventEmitter<void>();

  // is modal open
  isOpen = false;

  // action spinner
  showActionSpinner = false;

  // action complete sub
  actionComplete$: Subscription

  private element: any;

  constructor(
    private _modalService: ModalService,
    private _el: ElementRef
  ) {
    this.element = _el.nativeElement;
  }

  ngOnInit() {
    this.actionComplete$ = this._modalService.actionComplete$.subscribe((complete) => {
      if (complete) {
        this.showActionSpinner = false;
        this._modalService.close();
        return;
      }
      this.showActionSpinner = false;
    })

    // add self (this modal instance) to the modal service so it can be opened from any component
    this._modalService.add(this);

    // move element to bottom of page (just before </body>) so it can be displayed above everything else
    document.body.appendChild(this.element);

    // close modal on background click
    this.element.addEventListener('click', (el: any) => {
        if (el.target.className === 'modal') {
          this.closeModal();
        }
    });
  }

  // open modal
  open() {
    this.element.style.display = 'block';
    document.body.classList.add('modal-open');
    this.isOpen = true;
  }

  // close modal
  closeModal() {
    this.element.style.display = 'none';
    document.body.classList.remove('modal-open');
    this.isOpen = false;
    this.close.emit();
  }

  // handle confirm button
  handleConfirm() {
    this.showActionSpinner = true;
    this.confirm.emit();
  }

  ngOnDestroy() {
    this.actionComplete$ && this.actionComplete$.unsubscribe();
    // remove self from modal service
    this._modalService.remove(this);
    // remove modal element from html
    this.element.remove();
  }
}
