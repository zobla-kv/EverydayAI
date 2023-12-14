import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FilterEvent, ProductColor, ProductFilters } from '@app/models';
import { first } from 'rxjs';

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
    private _router: Router
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
      })
    })
  }

  // make sure it contains expected value
  validateUrlParams(filterName: string, filterValue: string): boolean {
    // validate url param name
    if (!this.filters[filterName]) {
      return false;
    }
    // make sure it contains allowed value
    return !!this.filters[filterName].possibleValues?.includes(filterValue);
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
  }

}
