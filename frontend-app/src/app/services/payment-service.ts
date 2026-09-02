import {
  Injectable
} from '@angular/core';

import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

import {
  Observable
} from 'rxjs';

import {
  environment
} from '../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  private apiUrl =
    `${environment.apiUrl}/payment`;


  constructor(
    private http: HttpClient
  ) {}


  createOrder(): Observable<any> {

    const token =
      localStorage.getItem(
        'accessToken'
      );


    const headers =
      new HttpHeaders({

        Authorization:
          `Bearer ${token}`

      });


    return this.http.post(

      `${this.apiUrl}/create-order`,

      {},

      {
        headers
      }

    );

  }


  verifyPayment(
    paymentResponse: any
  ): Observable<any> {

    const token =
      localStorage.getItem(
        'accessToken'
      );


    const headers =
      new HttpHeaders({

        Authorization:
          `Bearer ${token}`

      });


    return this.http.post(

      `${this.apiUrl}/verify`,

      paymentResponse,

      {
        headers
      }

    );

  }


  getPlan(): Observable<any> {

    const token =
      localStorage.getItem(
        'accessToken'
      );


    const headers =
      new HttpHeaders({

        Authorization:
          `Bearer ${token}`

      });


    return this.http.get(

      `${this.apiUrl}/plan`,

      {
        headers
      }

    );

  }

}

