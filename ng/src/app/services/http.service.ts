import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable, Subscription, catchError, first, map, of, tap } from 'rxjs';

import {
  Email,
  PaymentObject,
  ProductResponse
} from '@app/models';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(
    private _http: HttpClient
  ) { }

  // call endpoint for sending email
  sendEmail(body: Email): Promise<boolean> {
    return new Promise((resolve) => {
      this._http
      // PRODUCTION:
      .post<any>('http://localhost:3000/api/send-email', body, { headers: { 'Content-type': 'application/json' }, observe: 'response' })
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
      // PRODUCTION:
      .get<any>('http://localhost:3000/api/crypto', { headers: { 'Content-type': 'application/json' } })
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
        // PRODUCTION:
        'http://localhost:3000/api/stripe-create-payment-intent',
        data,
        { headers: { 'Content-type': 'application/json'} },
      )
      .pipe(
        map((response: HttpResponse<any>) => response),
        // NOTE: success response with bad code
        catchError(async (err) => err)
      )
      .subscribe(data => resolve(data));
    })
  }

  // upload file to server
  uploadFile(file: FormData): Promise<void> {
    return new Promise((resolve, reject) => {
      this._http
      .post<any>('http://localhost:3000/api/upload-file', file)
      .pipe(
        // NOTE: consider adding first() everywhere
        first(),
        map(status => {
          if (status === 220) {
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

  // get product image from BE
  getProductImage(imgPath: string) {
    return this._http
    .get<any>(
      `http://localhost:3000/api/image/${imgPath}`, 
      {
        headers: { 'Content-Type': 'image' },
        responseType: 'blob' as 'json'
      }
    )
    .pipe(
      catchError(async (err) => {
        // TODO: what happens on error in list
        console.log('catch err: ', err);
        return err;
      })
    )
  }

  // get image from cross origin as blob
  // make it downloadable
  fetchImageUrlAsBlob(imgPath: string): Observable<Blob | void> {
    return this._http
    .get<any>(
      imgPath, 
      { 
        headers: { 'Content-Type': 'image/jfif+jpg+jpeg+png' }, 
        responseType: 'blob' as 'json' 
      }
    )
  }

  // bypass circular dependency using injector
  // private _injector: Injector,
  // this._injector.get<FirebaseService>(FirebaseService);

}
