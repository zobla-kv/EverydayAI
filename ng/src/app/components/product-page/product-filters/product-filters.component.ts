import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';

// TODO: initiate dropdown after list has loaded to avoid brief freeze. Recheck this with smaller image size

import {
  ProductColor,
  ProductFilters,
  FilterEvent,
  ToastConstants,
} from '@app/models';

import {
  FirebaseService,
  ToastService
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

  // is product list currently fetching
  $listFetchingSub$: Subscription;
  isProductListFetching = true;

  constructor(
    private _firebaseService: FirebaseService,
    private _toast: ToastService
  ) {}

  ngOnInit() {
    this.$listFetchingSub$ = this._firebaseService.isProductListFetching$.subscribe(isFethcing => this.isProductListFetching = isFethcing);
  }

  // handle filter select
  handleFilterSelect(filterName: string, filterValue: string) {
    if (!this.isProductListFetching) {
      this.filters[filterName].value = filterValue;
      this.select.emit({ filters: this.filters, targetFilter: filterName });
    } else {
      this._toast.open(ToastConstants.MESSAGES.PRODUCT_FILTER_SPAM, ToastConstants.TYPE.ERROR.type)
    }
  }

  ngAfterViewInit() {
    this.filterItems         = [].slice.call(document.querySelectorAll('.filter-item'));
    this.filterDropdownItems = [].slice.call(document.querySelectorAll('.filter-dropdown-item'));
    this.dropdownArrow       = document.querySelector('.active-filter-arrow') as HTMLElement;
    this.filterDropdown      = document.querySelector('.filter-dropdown') as HTMLElement;

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
		// set filter id
		this.activeFilter = el.getAttribute('filter') as string;

		// related dropdown item
		const activeFilterDropdown = document.querySelector(`.filter-dropdown-item[filter="${this.activeFilter}"]`) as HTMLElement;

    // dropdownItem rectangle
		const dropdownItemRectangle = activeFilterDropdown?.getBoundingClientRect();

		// mouseenter target rectangle
		const targetElement = el.getBoundingClientRect();

		// remove active class from inactive items in menu
		this.filterItems.forEach(el => el.classList.remove('active'));
		// add active to current one
		el.classList.add('active');

		// hide inactive dropdown items
		this.filterDropdownItems.forEach(el => {
      el.style.opacity = '0';
      // because of absolute positioning
      el.style.zIndex = '-1';
      el.style.pointerEvents = 'none';
    });
    // show current active one
		activeFilterDropdown.style.opacity = '1';
    activeFilterDropdown.style.zIndex = '1'
    activeFilterDropdown.style.pointerEvents = 'auto';

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
		// remove active class from all filter items
		this.filterItems.forEach(el => el.classList.remove('active'));
		// hide all dropdowns
		this.filterDropdownItems.forEach (el => {
      el.style.opacity = '0';
      el.style.zIndex = '-1';
      el.style.pointerEvents = 'none';
    })
		// hide arrow
		this.dropdownArrow.style.opacity = '0';
		// unset selected menu
		this.activeFilter = null;
	};

  // keep order of keyvalue pipe (not DRY)
  keepOrder() { return 0; }

  ngOnDestroy() {
    this.$listFetchingSub$.unsubscribe();
  }

}
