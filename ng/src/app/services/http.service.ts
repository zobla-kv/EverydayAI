import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { catchError, map } from 'rxjs';

import {
  Email
} from '@app/models';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(
    private http: HttpClient
  ) { }

  sendVerificationEmail(endpoint: string, body: Email): Promise<boolean> {
    return new Promise((resolve) => {
      this.http
      .post<any>(endpoint, body, { headers: { 'Content-type': 'application/json' }, observe: 'response' })
      .pipe(
        map(data => true),
        catchError(async () => false)
      )
      .subscribe(isSent => resolve(isSent));
    })
  }

}
