import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ReplaySubject, Subject } from 'rxjs';

import { BreakpointObserver, BreakpointState, Breakpoints } from '@angular/cdk/layout';

import { Decimal } from 'decimal.js';

import {
  CustomUser,
  ProductResponse,
} from '@app/models';

/**
 * Unrelated utility methods.
 *
 *
 */
@Injectable({
  providedIn: 'root'
})
export class UtilService {

  // app load complete and preload animation started
  appLoaded$ = new Subject<void>();

  // preload animation done
  appLoadedAnimationComplete$ = new Subject<void>();

  // log/reg buttons
  authButtonClick$ = new Subject<string>();

  // screen size
  screenSizeChange$ = new ReplaySubject<string>();

  // screen size map
  screenSizeMap = new Map([
    [Breakpoints.XSmall, 'xs'],
    [Breakpoints.Small,  'sm'],
    [Breakpoints.Medium, 'md'],
    [Breakpoints.Large,  'lg'],
    [Breakpoints.XLarge, 'xl'],
  ]);

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _bo: BreakpointObserver
  ) {

    this._bo.observe([
      Breakpoints.XLarge,
      Breakpoints.Large,
      Breakpoints.Medium,
      Breakpoints.Small,
      Breakpoints.XSmall
    ])
    .subscribe((bs: BreakpointState) => {
      for (const query of Object.keys(bs.breakpoints)) {
        if (bs.breakpoints[query]) {
          const size = this.screenSizeMap.get(query) ?? 'Unknown';
          this.screenSizeChange$.next(size)
        }
      }
    })
  }

/**
  * Handle all stuff needed after app has loaded
  *
  * @returns void
  */
  appLoaded(): void {
    console.log('app loaded');
    document.cookie = 'new_session';
    this.appLoaded$.next();
  }

/**
  * Is user first visit in browser session
  * used to track if animation should be triggered etc.
  *
  * @return boolean
  */
  isFirstVisit(): boolean {
    let isFirstVisit = true;
    if (document.cookie.includes('new_session')) {
      isFirstVisit = false;
    }
    return isFirstVisit;
  }

/**
  * Load script at component level.
  *
  * @return boolean
  */
loadScript(url: string) {
  // TODO: error handling
  const body = document.body;
  const script = document.createElement('script');
  script.innerHTML = '';
  script.src = url;
  script.async = false;
  script.defer = true;
  body.appendChild(script);
}

/**
  * Navigates to information component
  * and display passed message
  * no mode trigger for now
  *
  * @param message string
  * @returns void
  */
  navigateToInformationComponent(message: string): void {
    this._router.navigate(['auth', 'verify'], { state: { message }, queryParams: { mode: 'info' } });
  }

/**
  * Gets parameter value from url
  *
  * @param param string
  * @returns string | null
  */
  getParamFromUrl(param: string): string | null {
    let paramValue = null;
    paramValue = this._route.snapshot.queryParamMap.get(param);
    return paramValue;
  }

/**
  * Gets items in range from an array
  * includes last from range (to)
  *
  * @param message string
  * @returns void
  */
  getFromRange(array: any[], from: number, to: number): any[] {
    // to + 1 because slice doesn't include last
    return array.slice(from, to + 1);
  }

/**
  * Returns deep copy of an object.
  *
  * @param object
  * @returns object
  */
  getDeepCopy(object: any): any {
    return JSON.parse(JSON.stringify(object));
  }


/**
  * Returns value of css style without 'px'.
  *
  * @param object
  * @returns object
  */
  getStyleValueWithoutPx(value: string): number {
    return parseInt(value.replace(/px/,''));
  }

/**
  * Sleep function.
  *
  * @param number - milliseconds
  * @returns Promise
  */
  sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

/**
  * Move elements in array to the right.
  *
  * @param Array - array
  * @returns Array - shifted array
  */
  rotateArrayToRight(array: Array<any>): Array<any> {
    array.unshift(array.pop());
    return array;
  }

/**
  * Move elements in array to the left.
  *
  * @param Array - array
  * @returns Array - shifted array
  */
  rotateArrayToLeft(array: Array<any>): Array<any> {
    array.push(array.shift());
    return array;
  }

/**
  * get price or discounted price for FE
  *
  * @param product - ProductResponse
  * @returns Decimal - use decimal because of precision loss
  */
  getProductPrice(product: ProductResponse): string {
    const price = product.discount > 0 ? (product.price  * (100 - product.discount) / 100) : product.price;
    const decimalPrice = new Decimal(price).toFixed(2);
    return decimalPrice;
  }

/**
  * get total product price sum
  *
  * @param products - ProductResponse[]
  * @returns totalSum - price as string with precision 2
  */
  getTotalSum(products: ProductResponse[]): number {
    let totalSum = new Decimal(0);
    products.forEach(product => {
      const price = product.discount > 0 ? (product.price  * (100 - product.discount) / 100) : product.price;
      totalSum = totalSum.plus(new Decimal(price));
    })
    return Number(totalSum.toFixed(2));
  }

/**
  * set 404 image on target element
  *
  * @param target - target element (img)
  */
  set404Image(target: any): void {
    target.src = '../../assets/images/cesar-millan.png';
  }

// // NOTE: unused - left for ref
// /**
//   * set 404 image when product fails to load
//   *
//   * @param product - ProductResponse
//   */
//   setProduct404Image(product: ProductResponse): void {
//     product.watermarkImgPath = '../../assets/images/cesar-millan.png';
//   }

/**
  * get file extension from file name
  *
  * @param fileName - name of the file
  */
  getFileExtension(fileName: string) {
    return fileName.split('.').pop();
  }

/**
  * get file size in mb with 1 decimal
  *
  * @param file - File
  * @return size - file size in mb
  */
  getFileSizeInMb(file: File): string {
    let fileSize = (file.size / (1024 * 1024)).toFixed(1);
    if (fileSize === '0.0') {
      fileSize = '0.1';
    }
    return fileSize + ' mb';
  }

/**
  * get image resolution from file
  *
  * @param file - File
  */
  async getImageResolution(file: File): Promise<string> {
    let resolution = '';
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = async ev => {
        const image = new Image();
        image.src = ev.target?.result as string;

        image.onload = (img: any) => {
          resolution = `${image.width}x${image.height}`;
          resolve(resolution);
        }
      }
    })
  }

/**
  * get extension rom type mime type
  *
  * @param mimeType - string
  * @return file extesion - string
  */
  getExtensionFromMimeType(mimeType: string): string {
    switch(mimeType) {
      case 'image/jpg':
        return '.jpg';
      case 'image/jpeg':
        return '.jpg';
      case 'image/png':
        return '.png';
      case 'image/svg+xml':
        return '.svg'
      default:
        throw new Error('no such mimeType: ' + mimeType);
    }
  }

/**
  * get mime type from extension
  *
  * @param extension - string
  * @return mimeType - string
  */
  getMimeTypeFromExtension(extension: string): string {
    switch(extension) {
      case 'jpg':
        return 'jpg';
      case 'jpeg':
        return 'jpeg';
      case 'png':
        return 'png';
      case 'svg':
        return 'svg+xml'
      default:
        throw new Error('no such extension: ' + extension);
    }
  }

/**
  * Sort objects by creation date descending
  *
  * @param products - ProductResponse[]
  * @return products - sorted ProductResponse[]
  * NOTE: can be replaced by firebase' orderBy
  */
  sortByCreationDate(products: ProductResponse[]): ProductResponse[] {
    return products.sort((a,b) => {
      if (a.creationDate.toDate().getTime() - b.creationDate.toDate().getTime() < 0) {
        return 1;
      } else if (a.creationDate.toDate().getTime() - b.creationDate.toDate().getTime() > 0) {
        return -1;
      }
      return 0;
    });
  }

/**
  * Sort objects by owned since descending
  *
  * @param products - ProductResponse[]
  * @return products - sorted ProductResponse[]
  */
  sortByOwnedSince(products: ProductResponse[], user: CustomUser | null): ProductResponse[] {
    if (!user) {
      return products;
    }
    return products.sort((a,b) => {
      if (user.ownedItemsTimeMap[a.id].toDate().getTime() - user.ownedItemsTimeMap[b.id].toDate().getTime() < 0) {
        return 1;
      } else if (user.ownedItemsTimeMap[a.id].toDate().getTime() - user.ownedItemsTimeMap[b.id].toDate().getTime() > 0) {
        return -1;
      }
      return 0;
    });
  }

/**
  * Validate search input
  *
  * @param value - string
  * @return boolean - is it valid?
  */
  validateSeachInput(value: string): boolean {
    return /^[a-zA-Z0-9\s]*$/.test(value);
  }

/**
  * Get capitalized text
  *
  * @param text - string
  * @return capitalized text - string
  */
  capitalizeText(text: string): string {
    // don't capitalize if it doens't have more than 2 chars.
    if (text.length < 2) {
      return text;
    }
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

/**
  * Get zoom level - might not be exact as browser
  *
  * @return zoom level - number
  */
  getZoomLevel(): number {
    return Math.round(window.devicePixelRatio * 100);
  }

}
