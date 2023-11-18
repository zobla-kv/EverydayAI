import { Directive, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription, fromEvent, merge, of } from 'rxjs';
import { delay, map, switchMap } from 'rxjs/operators';

@Directive({
	selector: '[delayed-hover]',
})
export class DelayedHoverDirective implements OnInit, OnDestroy {
	@Input()
	delay = 1500;

	@Output('delayed-hover') hoverEvent = new EventEmitter();

  hideShowObs$: Subscription;

	constructor(private readonly element: ElementRef) {}

	ngOnInit() {
		const hide$ = fromEvent(this.element.nativeElement, 'mouseleave').pipe(map(_ => false));
		const show$ = fromEvent(this.element.nativeElement, 'mouseenter').pipe(map(_ => true));

		this.hideShowObs$ = merge(hide$, show$)
			.pipe(
				switchMap(show => {
					if (!show) {
						return of(false);
					}
					return of(true).pipe(delay(this.delay));
				})
			)
			.subscribe(show => {
				if (show) {
					this.hoverEvent.emit();
				}
			});
	}

	ngOnDestroy() {
    this.hideShowObs$ && this.hideShowObs$.unsubscribe();
  }
}
