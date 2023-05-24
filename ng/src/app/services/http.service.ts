import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';

import { catchError, map } from 'rxjs';

import {
  Email, 
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
      .get<any>('http://localhost:3000/api/crypto', { headers: { 'Content-type': 'application/json' } })
      .pipe(
        map(data => data.response),
        catchError(async () => reject(''))
      )
      .subscribe(key => resolve(key));
    })
  }

  // bypass circular dependency using injector
  // private _injector: Injector,
  // this._injector.get<FirebaseService>(FirebaseService);

}
