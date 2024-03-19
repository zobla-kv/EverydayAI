import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';

// TODO: initiate dropdown after list has loaded to avoid brief freeze. Recheck this with smaller image size

import {
  ProductColor,
  ProductFilters,
  FilterEvent,
  ToastMessages
} from '@app/models';

import {
  FirebaseService,
  ToastService,
  UtilService
} from '@app/services';

@Component({
  selector: 'app-product-filters',
  templateUrl: './product-filters.component.html',
  styleUrls: ['./product-filters.component.scss']
})
export class ProductFiltersComponent implements OnInit, AfterViewInit, OnDestroy {
  // filters
  @Input() filters: ProductFilters;

  // when filter selected
  @Output() select = new EventEmitter<FilterEvent>();

  // filter map from enum
  colorFilterMap = new Map(Object.keys(ProductColor).map(key => [key, ProductColor[key as keyof typeof ProductColor]]));

  // map icon (mat icons)
  sortIconMap = new Map([
    ['latest', 'fiber_new'],
    ['price desc', 'arrow_downward'],
    ['price asc', 'arrow_upward'],
    ['popular', 'people'],
    ['owned desc', 'arrow_downward'],
    ['owned asc', 'arrow_upward'],
  ]);

  activeFilter: string | null;
  dropdownArrow: HTMLElement;
  filterItems: HTMLElement[];
  filterDropdownItems: HTMLElement[];
  filterDropdown: HTMLElement;
	closeDropdownTimeout: any;

  // search sub
  searchSub$: Subscription;

  // is product list currently fetching
  listFetchingSub$: Subscription;
  isProductListFetching = false;

  constructor(
    private _firebaseService: FirebaseService,
    private _toast: ToastService,
    private _utilService: UtilService
  ) {}

  ngOnInit() {
    this.listFetchingSub$ = this._firebaseService.isProductListFetching$.subscribe(isFethcing => this.isProductListFetching = isFethcing);
    this.searchSub$ = this._firebaseService.search$.subscribe(value => {
      if (this._utilService.validateSeachInput(value)) {
       this.handleFilterSelect('search', value);
      } else {
       this._toast.showErrorMessage(ToastMessages.SEARCH_INPUT_VALIDATION_ERROR);
      }
    });
  }

  // handle filter select
  handleFilterSelect(filterName: string, filterValue: string) {
    if (!this.isProductListFetching) {
      this.select.emit({ filterName, filterValue });
    } else {
      this._toast.showErrorMessage(ToastMessages.PRODUCT_FILTER_SPAM);
    }
    this.closeDropdown();
  }

  ngAfterViewInit() {
    this.filterItems         = [].slice.call(document.querySelectorAll('.filter-item'));
    this.filterDropdownItems = [].slice.call(document.querySelectorAll('.filter-dropdown-item'));
    this.dropdownArrow       = document.querySelector('.active-filter-arrow') as HTMLElement;
    this.filterDropdown      = document.querySelector('.filter-dropdown') as HTMLElement;

    // make dropdown unclickable at start
    this._setHideStyles(this.filterDropdown);

    // bind event to each filter item
    this.filterItems.forEach(el => {
    	el.addEventListener('mouseenter', (ev: any) => {
    		this.stopCloseTimeout();
    		this.openDropdown(ev.target);
    	}, false);

    	el.addEventListener('mouseleave', () => this.startCloseTimeout(), false);
    });

    // bind event to each dropdown
    this.filterDropdownItems.forEach(el => {
    	el.addEventListener('mouseenter', () => this.stopCloseTimeout(), false);
    	el.addEventListener('mouseleave', () => this.startCloseTimeout(), false);
    });
  }

	startCloseTimeout() {
		this.closeDropdownTimeout = setTimeout(() => this.closeDropdown(), 150);
	}

	stopCloseTimeout() {
		clearTimeout(this.closeDropdownTimeout);
	}

	openDropdown(el: HTMLElement) {
    // make dropdown clickable
    this._setShowStyles(this.filterDropdown);

		// set filter id
		this.activeFilter = el.getAttribute('filter') as string;

		// related dropdown item
		const activeFilterDropdown = document.querySelector(`.filter-dropdown-item[filter="${this.activeFilter}"]`) as HTMLElement;

    // dropdownItem rectangle
		const dropdownItemRectangle = activeFilterDropdown?.getBoundingClientRect();

		// mouseenter target rectangle
		const targetElement = el.getBoundingClientRect();

    // make whole dropdown react to mouseenter
		this._setShowStyles(this.filterDropdown);

		// hide inactive dropdown items
		this.filterDropdownItems.forEach(el => this._setHideStyles(el));

    // show current active one
    this._setShowStyles(activeFilterDropdown);

    let dropdownPositionLeft: any = el.offsetLeft - (( dropdownItemRectangle!.width / 2 ) - targetElement.width / 2 );

    // if out of screen left
    if (dropdownPositionLeft < 0) {
      dropdownPositionLeft = 5;
    }
    // if out of screen right
    if (targetElement.x + dropdownItemRectangle.width / 2 > window.innerWidth) {
      dropdownPositionLeft = dropdownPositionLeft - dropdownItemRectangle.width / 2 + 18;
    }
    dropdownPositionLeft += 'px';

		// set arrow position
		this.dropdownArrow.style.opacity  = '1';
		this.dropdownArrow.style.left     = el.offsetLeft + targetElement.width / 2 - 10 + 'px';

    // set dropdown position
		this.filterDropdown.style.left    = dropdownPositionLeft;
		this.filterDropdown.style.width   = dropdownItemRectangle?.width + 'px';
		this.filterDropdown.style.height  = dropdownItemRectangle?.height + 'px';
    this.filterDropdown.style.opacity = '1';
	}

	closeDropdown() {
    // make whole dropdown not react to mouseenter
    this._setHideStyles(this.filterDropdown);
		// hide all dropdown items
		this.filterDropdownItems.forEach(el => this._setHideStyles(el))
		// hide arrow
		this.dropdownArrow.style.opacity = '0';
		// unset selected menu
		this.activeFilter = null;
	};

  private _setShowStyles(el: HTMLElement) {
		el.style.opacity = '1';
    el.style.zIndex = '10'
    el.style.pointerEvents = 'auto';
  }

  private _setHideStyles(el: HTMLElement) {
    el.style.opacity = '0';
    // because of absolute positioning
    el.style.zIndex = '-1';
    el.style.pointerEvents = 'none';
  }

  // keep order of keyvalue pipe (not DRY)
  keepOrder() { return 0; }

  ngOnDestroy() {
    this.listFetchingSub$.unsubscribe();
    this.searchSub$.unsubscribe();
  }

}
