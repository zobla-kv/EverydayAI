import { Injectable, Injector } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams, HttpResponse } from '@angular/common/http';

import { environment } from '@app/environment';

import { Observable, catchError, concatMap, first, map, of } from 'rxjs';

import {
  FirebaseService,
  UtilService
} from '@app/services';

import {
  CustomUser,
  Email,
  PaymentObject,
  ProductResponse,
  ProductType
} from '@app/models';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(
    private _http: HttpClient,
    private _injector: Injector,
    private _utilService: UtilService
  ) { }

  // TODO: Improper error handling, empty arrays returned on error
  // Error check in components [].length === 0 should be rewritten when going for fix

  // fetch news for footer
  fetchNews(): Observable<any> {
    return this._http
    .get<any>(`${environment.API_HOST}/api/news`)
    .pipe(
      catchError(async err => [])
    )
  }

  // call endpoint for sending email
  sendEmail(body: Email): Promise<boolean> {
    return new Promise((resolve) => {
      this._http
      .post<any>(`${environment.API_HOST}/api/send-email`, body, { headers: { 'Content-type': 'application/json' }, observe: 'response' })
      .pipe(
        map(data => true),
        catchError(async () => false)
      )
      .subscribe(isSent => resolve(isSent));
    })
  }

  // gets private key from BE
  getPrivateKey(): Promise<string> {
    return new Promise((resolve, reject) => {
      this._http
      .get<any>(`${environment.API_HOST}/api/crypto`, { headers: { 'Content-type': 'application/json' } })
      .pipe(
        map(data => data.response),
        catchError(async () => reject(''))
      )
      .subscribe(key => resolve(key));
    })
  }

  // initiate payment
  initiatePayment(data: PaymentObject): Promise<any> {
    return new Promise((resolve, reject) => {
      this._http
      .post<any>(
        `${environment.API_HOST}/api/stripe-create-payment-intent`,
        data,
        { headers: { 'Content-type': 'application/json'} },
      )
      .pipe(
        map((response: HttpResponse<any>) => response),
        // NOTE: success response with bad code
        catchError(async (err) => reject(err))
      )
      .subscribe(data => resolve(data));
    })
  }

  // upload file to server
  uploadFile(file: FormData): Promise<void> {
    return new Promise((resolve, reject) => {
      this._http
      .post<any>(`${environment.API_HOST}/api/upload-file`, file)
      .pipe(
        // NOTE: consider adding first() everywhere
        first(),
        map(isUploaded => {
          if (isUploaded) {
            resolve();
          } else {
            reject('File not uploaded');
          }
        }),
        catchError(async (err: HttpErrorResponse) => reject(err))
      )
      .subscribe();
    })

  }

  // get all products from db
  // TODO: move to firebase service?
  getProducts(productType: any, user: CustomUser | null, ids?: string[]): Observable<ProductResponse[] | []> {
    const firebaseService = this._injector.get<FirebaseService>(FirebaseService);
    let products$: Observable<any>;
    switch(productType) {
      case(ProductType.ALL):
        if (ids) {
          products$ = firebaseService.getProductsById(ids);
          break;
        }
        products$ = firebaseService.getAllProducts();
        break;
      case(ProductType.PRINTS.SHOP):
        products$ = firebaseService.getProductsForTypePrintTabShop(user);
        break;
      case(ProductType.PRINTS.OWNED_ITEMS):
        products$ = firebaseService.getProductsForTypePrintTabOwnedItems(user);
        break;
      default:
        throw new Error('Unable to fetch products. Invalid type: ', productType);
    }

    // fetch image from BE and then update imgPath field to base64
    // NOTE: using base64 because unable to stringify a blob on BE
    return products$
    .pipe(
      concatMap((products: ProductResponse[]) => {
        console.log('products res: ', products);
        if (products.length === 0) {
          return of([]);
        }
        return this.getProductImages([...products.map((product: any) => product.fileName)])
        .pipe(
          map(images => {
            products.forEach((product, i) => {
              if (images[i]) {
                const extension = this._utilService.getMimeTypeFromExtension(products[i].fileName.split('.')[1])
                product.imgPath = `data:image/${extension};base64, ` + images[i];
              } else {
                product.imgPath = '../../assets/images/img/cesar-millan.png';
              }
            })
            return products;
          })
        );
      }),
      catchError(async err => [])
    );
  }

  // get product images from BE
  getProductImages(fileNames: string[]): Observable<(ArrayBufferLike)[]> {
    const params = new HttpParams({
      fromObject: { 'fileNames[]': fileNames }
    })
    return this._http
    .get<any>(
      `${environment.API_HOST}/api/product-images`,
      {
        responseType: 'json',
        params
      }
    )
    .pipe(
      catchError(async err => [])
    )
  }

  // get product image from BE
  getProductImage(fileName: string): Observable<string | null> {
    return this._http
    .get<any>(
      `${environment.API_HOST}/api/product-image/${fileName}`,
      // {
      //   headers: { 'Content-Type': 'image' },
      //   responseType: 'blob' as 'json'
      // }
    )
    .pipe(
      map(buffer => {
        if (!buffer) {
          return null;
        }
        const extension = this._utilService.getMimeTypeFromExtension(fileName.split('.')[1])
        return `data:image/${extension};base64, ` + buffer;
      }),
      catchError(async err => null)
    )
  }

  // delete item
  deleteItem(fileName: string): Observable<string | null> {
    return this._http.delete<any>(`${environment.API_HOST}/api/delete-image/${fileName}`);
  }

  // bypass circular dependency using injector
  // private _injector: Injector,
  // this._injector.get<FirebaseService>(FirebaseService);

}
