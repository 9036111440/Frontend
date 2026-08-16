import {
  Injectable
} from '@angular/core';

import {
  HttpClient
} from '@angular/common/http';

import {
  Observable
} from 'rxjs';
import { environment } from '../environments/environment';


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