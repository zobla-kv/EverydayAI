import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(
    private http: HttpClient
  ) { }


  sendPostRequest(endpoint: string, data: Object) {
    console.log('post request data: ', data);
    this.http.post(endpoint, data).subscribe(response => {
      console.log('response is: ', response);
    })
  }
}
