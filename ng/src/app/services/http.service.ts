import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

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

  // bypass circular dependency using injector
  // private _injector: Injector,
  // this._injector.get<FirebaseService>(FirebaseService);

}
