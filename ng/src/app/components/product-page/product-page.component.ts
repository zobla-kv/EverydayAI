import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs';

// TODO: list losing all queries on exit and comeback, might be solved by reuse strategy

import {
  FilterEvent,
  ProductColor,
  ProductFilters
} from '@app/models';

import {
  FirebaseService,
  UtilService
} from '@app/services';

const FILTER_SEARCH = 'search';

@Component({
  selector: 'app-product-page',
  templateUrl: './product-page.component.html',
  styleUrls: ['./product-page.component.scss']
})
export class ProductPageComponent implements OnInit {

  // page title
  title = 'Dog art';

  // active filters
  filters: ProductFilters = {
    search:      { value: '',    default: '',    possibleValues: [] },
    orientation: { value: 'all', default: 'all', possibleValues: ['all', 'landscape', 'portrait'] },
    price:       { value: 'all', default: 'all', possibleValues: ['all', 'free', 'on sale']       },
    color:       { value: 'all', default: 'all', possibleValues: [...Object.keys(ProductColor)]   },
    sort: {
      value: 'latest',
      default: 'latest',
      possibleValues: ['latest', 'price desc', 'price asc', 'popular'] // TODO: 'owned desc', 'owned asc' - implement later
    },
  }

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _firebaseService: FirebaseService,
    private _utilService: UtilService,
  ) {}

  ngOnInit() {
    this._route.queryParamMap.pipe(first()).subscribe(params => {
      params.keys.forEach(key => {
        const paramName = key;
        const paramValue = params.get(key) as string;
        const isValid = this.validateUrlParams(paramName, paramValue);
        if (isValid) {
          this.filters[key].value = paramValue;
        }

        if (paramName === FILTER_SEARCH) {
          // filter sub is not catching because its not initailized yet, and it should stay that way
          // set search input value regardless if it is valid, but not actual filter (above)
          this._firebaseService.search$.next(paramValue);
          this.setPageTitle(paramValue);
        }
      })
    })
  }

  // make sure it contains expected value
  validateUrlParams(filterName: string, filterValue: string): boolean {
    // validate url param name
    if (!this.filters[filterName]) {
      return false;
    }

    // validate search
    if (filterName === FILTER_SEARCH) {
      return this._utilService.validateSeachInput(filterValue);
    }

    // for others, make sure it contains allowed value
    return !!this.filters[filterName].possibleValues.includes(filterValue);
  }

  // handle filter select
  handleFilter(event: FilterEvent): void {
    const newFilterValue = event.filters[event.targetFilter].value;
    const previousFilterValue = this._route.snapshot.queryParams[event.targetFilter];
    if (newFilterValue === previousFilterValue) {
      return;
    }

    this._router.navigate([], {
      relativeTo: this._route,
      queryParams: { [event.targetFilter]: newFilterValue === this.filters[event.targetFilter].default ? null : newFilterValue },
      queryParamsHandling: 'merge',
    });

    // direct assign doesnt trigger ngOnChanges
    this.filters = { ...event.filters };

    if (event.targetFilter === FILTER_SEARCH) {
      this.setPageTitle(this.filters[FILTER_SEARCH].value);
    }
  }

  // set page title and h1 tag
  setPageTitle(title: string) {
    // capitalalize first letter
    const capitalized =  title.charAt(0).toUpperCase() + title.slice(1);
    document.title = capitalized;
    this.title = capitalized;
  }

  ngOnDestroy() {
    // TODO: reuse strategy change
    document.title = 'House of dogs';
  }

}
