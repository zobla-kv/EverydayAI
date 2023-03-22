import { Injectable, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { catchError, map, Observable } from 'rxjs';

import {
  Email, 
  Product
} from '@app/models';

import { 
  FirebaseService 
} from '@app/services';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(
    private _http: HttpClient,
    // bypass circular dependency using injector
    // private _firebaseService: FirebaseService
    private _injector: Injector,
  ) { }

  // get all products
  getProducts(): Observable<Product[]> {
    const firebaseService = this._injector.get<FirebaseService>(FirebaseService);
    return firebaseService.getProducts();
  }

  // call endpoint for sending email
  sendEmail(body: Email): Promise<boolean> {
    return new Promise((resolve) => {
      this._http
      .post<any>('http://localhost:3000/api/send-email', body, { headers: { 'Content-type': 'application/json' }, observe: 'response' })
      .pipe(
        map(data => true),
        catchError(async () => false)
      )
      .subscribe(isSent => resolve(isSent));
    })
  }

}
