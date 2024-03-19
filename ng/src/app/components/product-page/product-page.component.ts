import { ProductListComponent } from './product-list/product-list.component';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Title } from '@angular/platform-browser';

import { Subscription, first } from 'rxjs';

import {
  FilterEvent,
  ProductColor,
  ProductFilters
} from '@app/models';

import {
  FirebaseService,
  ProductService,
  UtilService
} from '@app/services';

const FILTER_SEARCH = 'search';

@Component({
  selector: 'app-product-page',
  templateUrl: './product-page.component.html',
  styleUrls: ['./product-page.component.scss']
})
export class ProductPageComponent implements OnInit, OnDestroy {
  // product list
  @ViewChild(ProductListComponent) ProductListComponent: ProductListComponent;

  // page title default
  defaultTitle = 'Images';

  // page title
  title = this.defaultTitle;

  // active filters
  filters: ProductFilters = {
    search:      { value: '',    default: '',    possibleValues: [] },
    orientation: { value: 'all', default: 'all', possibleValues: ['all', 'landscape', 'portrait'] },
    price:       { value: 'all', default: 'all', possibleValues: ['all', 'free', 'on sale']       },
    color:       { value: 'all', default: 'all', possibleValues: [...Object.keys(ProductColor)]   },
    sort: {
      value: 'latest',
      default: 'latest',
      possibleValues: ['latest', 'price desc', 'price asc', 'popular']
    },
  }

  // product details close event
  productDetailsClosed$: Subscription;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _firebaseService: FirebaseService,
    private _utilService: UtilService,
    private _location: Location,
    private _productService: ProductService,
    private _titleService: Title,
  ) {}

  ngOnInit() {
    this.setPageTitle(this.defaultTitle);
    // set filters from query params
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

      this.productDetailsClosed$ = this._productService.productDetailsClosed$.subscribe(() => this.setPageTitle(this.title))
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
    const newFilterValue = event.filterValue;
    const previousFilterValue = this.filters[event.filterName].value;

    if (newFilterValue === previousFilterValue) {
      return;
    }

    this.filters[event.filterName].value = newFilterValue;

    // direct assign doesnt trigger ngOnChanges
    this.filters = { ...this.filters };

    this.addQueryParamsToUrl();

    if (event.filterName === FILTER_SEARCH) {
      this.setPageTitle(this.filters[FILTER_SEARCH].value);
    }
  }

  // set page title and h1 tag
  setPageTitle(title: string) {
    if (!title) {
      title = this.defaultTitle;
    }
    const capitalized = this._utilService.capitalizeText(title);
    this.title = capitalized;
    this._titleService.setTitle(capitalized);
  }

  // for reuse strategy to set query params because ngOnInit not called
  onAttach() {
    const searchFromQueryParam = this._route.snapshot.queryParamMap.get('search');
    if (searchFromQueryParam) {
      this._firebaseService.search$.next(searchFromQueryParam);
    }
    this.addQueryParamsToUrl();
    this.setPageTitle(this.title);
    this.ProductListComponent.fixMasonryLayout();
  }
  // for reuse strategy to set zoom out level on exit
  onDetach() {
    this.ProductListComponent.prevZoomLevel = this._utilService.getZoomLevel();
  }

  // appends query params to url
  addQueryParamsToUrl() {
    // construct queryParams from active filters
    let queryParams = new HttpParams();
    Object.keys(this.filters).forEach(key => {
      const filter = this.filters[key];
      if (filter.value !== filter.default) {
        queryParams = queryParams.append(key, filter.value);
      }
    });

    // append them to route
    this._location.go(this._router.url.split('?')[0], queryParams.toString());
  }

  ngOnDestroy() {
    this.productDetailsClosed$ && this.productDetailsClosed$.unsubscribe();
  }

}
