import {
  Injectable
} from '@angular/core';

import {
  HttpClient
} from '@angular/common/http';

import {
  Observable
} from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  private apiUrl =
    'http://localhost:3000/api/payment';


  constructor(
    private http: HttpClient
  ) {}


  createOrder(): Observable<any> {

    return this.http.post(
      `${this.apiUrl}/create-order`,
      {}
    );

  }


  verifyPayment(
    paymentResponse: any
  ): Observable<any> {

    return this.http.post(
      `${this.apiUrl}/verify`,
      paymentResponse
    );

  }


  getPlan(): Observable<any> {

    return this.http.get(
      `${this.apiUrl}/plan`
    );

  }

}