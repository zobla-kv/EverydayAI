import { Injectable, Injector } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { Observable, catchError, first, map } from 'rxjs';

import environment from '@app/environment';

import {
  FirebaseService
} from '@app/services';

import {
  CustomUser,
  Email,
  EmailType,
  ProductResponse,
  ProductType,
  ProductUploadResponse,
  createOrderApiResponse
} from '@app/models';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(
    private _http: HttpClient,
    private _injector: Injector,
  ) { }

  // TODO: Improper error handling, empty arrays returned on error
  // Error check in components [].length === 0 should be rewritten when going for fix

  // fetch news for footer - disabled
  // fetchNews(): Observable<any> {
  //   return this._http
  //   .get<any>(`${environment.API_HOST}/api/news`)
  //   .pipe(
  //     catchError(async err => [])
  //   )
  // }

  // call endpoint for sending email
  sendEmail(body: Email): Promise<boolean> {
    let endpoint = '';
    if (body.email_type === EmailType.ACTIVATION) {
      endpoint = `${environment.API_HOST}/api/email/activation`;
    } else {
      endpoint = `${environment.API_HOST}/api/email/reset-password`;
    }

    return new Promise((resolve) => {
      this._http
      .post(endpoint, { email: body.email }, { headers: { 'Content-type': 'application/json' }, responseType: 'text' })
      .pipe(
        map(data => true),
        catchError(async () => false)
      )
      .subscribe(isSent => resolve(isSent));
    })
  }

  // create order
  createOrder(userId: string, cartItems: string[], isGenerated: boolean): Promise<string> {
    return new Promise((resolve, reject) => {
      this._http.post<createOrderApiResponse>(`${environment.API_HOST}/api/paypal/create-order`, { userId, cartItems, isGenerated })
      .subscribe({
        next: (response: createOrderApiResponse) => resolve(response.orderId),
        error: (err: HttpErrorResponse) => reject(err.error)
      })
    })
  }

  // capture order
  captureOrder(userId: string, orderId: string, cartItems: string[], isGenerated: boolean): Promise<void> {
    return new Promise((resolve, reject) => {
      this._http.post(`${environment.API_HOST}/api/paypal/capture-order`, { userId, orderId, cartItems, isGenerated }, { responseType: 'text' })
      .subscribe({
        next: () => resolve(),
        error: (err: HttpErrorResponse) => reject(err.error)
      })
    })
  }

  // upload product image to server
  uploadImage(file: FormData): Promise<ProductUploadResponse> {
    return new Promise((resolve, reject) => {
      this._http
      .post<any>(`${environment.API_HOST}/api/products/upload-image`, file)
      .pipe(
        // TODO: consider adding first() everywhere
        first(),
        map(res => resolve(res.imgPaths)),
        catchError(async err => {
          err.cloudinary = err.error;
          reject(err);
        })
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

    return products$;
  }

  // add product to elastic search index
  addProductToElasticSearch(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this._http
      .put<any>(`${environment.API_HOST}/api/products/ingest/${id}`, {})
      .pipe(
        first(),
        map(res => resolve()),
        catchError(async err => {
          err.elastic = err.error;
          reject(err);
        })
      )
      .subscribe();
    })
  }

  // get products by search text
  getProductsBySearchText(text: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      this._http
      .get<string[]>(`${environment.API_HOST}/api/products/search/${text}`)
      .pipe(
        first(),
        map(res => resolve(res)),
        catchError(async err => resolve([])) // Don't want failing of search to stop other filters
      )
      .subscribe()
    })
  }

  // get generated image from prompt
  getImageFromPrompt(device: 'mobile' | 'pc', prompt: string): Observable<string> {
    const endpoint = `${environment.API_HOST}/api/ai/generate-image?device=${device}&prompt=${prompt}`;
    return this._http.get<string>(endpoint).pipe(first());
  };

  // get product image from BE with percentage
  // NOTE: WHY UNUSED: can't have percentage and avoid showing blob url (below file name) in download manager
  // to download create blobUrl from returned chunks and a.href = blobUrl
  async downloadImageByUrl(url: string): Promise<any> {
    const encodedUrl = encodeURIComponent(url);
    const response = await fetch(`${environment.API_HOST}/api/products/download-url?url=${encodedUrl}`);
    if (response.body) {
      let percentageDownloaded = 0;
      const fileSize = response.headers.get('Content-Length');
      const chunks = [];

      const reader = response.body.getReader();
      while (true) {
        const { done, value: chunk } = await reader.read();
        if (done) {
          reader.releaseLock();
          return chunks;
        }

        // NOTE: Formula to calculate percentage of something ((portion/total) * 100) + '%'
        percentageDownloaded += (chunk.length/Number(fileSize)) * 100;
        chunks.push(chunk);
      }
    }
  }

  // bypass circular dependency using injector
  // private _injector: Injector,
  // this._injector.get<FirebaseService>(FirebaseService);


  /* OLD WAY - saved for ref */

  // get all products from db (old way)
  // getProductsOld(productType: any, user: CustomUser | null, ids?: string[]): Observable<ProductResponse[] | []> {
  //   const firebaseService = this._injector.get<FirebaseService>(FirebaseService);
  //   let products$: Observable<any>;
  //   switch(productType) {
  //     case(ProductType.ALL):
  //       if (ids) {
  //         products$ = firebaseService.getProductsById(ids);
  //         break;
  //       }
  //       products$ = firebaseService.getAllProducts();
  //       break;
  //     case(ProductType.PRINTS.SHOP):
  //       products$ = firebaseService.getProductsForTypePrintTabShop(user);
  //       break;
  //     case(ProductType.PRINTS.OWNED_ITEMS):
  //       products$ = firebaseService.getProductsForTypePrintTabOwnedItems(user);
  //       break;
  //     default:
  //       throw new Error('Unable to fetch products. Invalid type: ', productType);
  //   }

  //   // fetch image from BE and then update imgPath field to base64
  //   // NOTE: using base64 because unable to stringify a blob on BE
  //   return products$
  //   .pipe(
  //     concatMap((products: ProductResponse[]) => {
  //       console.log('products res: ', products);
  //       if (products.length === 0) {
  //         return of([]);
  //       }
  //       return this.getProductImagesOld([...products.map((product: any) => product.fileName)])
  //       .pipe(
  //         map(images => {
  //           console.log('images: ', images);
  //           products.forEach((product, i) => {
  //             if (images[i]) {
  //               const extension = this._utilService.getMimeTypeFromExtension(products[i].fileName.split('.')[1]);
  //               product.imgPath = `data:image/${extension};base64, ` + images[i];
  //             } else {
  //               product.imgPath = '../../assets/images/img/cesar-millan.png';
  //             }
  //           })
  //           return products;
  //         })
  //       );
  //     }),
  //     catchError(async err => [])
  //   );
  // }

  // // get product images from BE
  // getProductImagesOld(fileNames: string[]): Observable<(ArrayBufferLike)[]> {
  //   const params = new HttpParams({
  //     fromObject: { 'fileNames[]': fileNames }
  //   })
  //   return this._http
  //   .get<any>(
  //     `${environment.API_HOST}/api/product-images`,
  //     {
  //       responseType: 'json',
  //       params
  //     }
  //   )
  //   .pipe(
  //     catchError(async err => [])
  //   )
  // }

}
