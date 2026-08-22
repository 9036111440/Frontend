import { Injectable } from '@angular/core';

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
export class AdminService {

  private readonly apiUrl =
    `${environment.apiUrl}/admin`;


  constructor(
    private readonly http: HttpClient
  ) {}


  /**
   * Common headers for all admin API requests.
   *
   * The access token is read from localStorage
   * because that is where your login flow stores it.
   */
  private getHeaders(): HttpHeaders {

    const accessToken =
      localStorage.getItem('accessToken');


    let headers =
      new HttpHeaders({
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      });


    if (accessToken) {

      headers =
        headers.set(
          'Authorization',
          `Bearer ${accessToken}`
        );

    }


    return headers;

  }


  /**
   * Get top-level dashboard numbers.
   */
  getOverview(): Observable<any> {

    return this.http.get<any>(

      `${this.apiUrl}/overview?t=${Date.now()}`,

      {
        headers:
          this.getHeaders()
      }

    );

  }


  /**
   * Get new users grouped by day.
   */
  getUsersPerDay(): Observable<any[]> {

    return this.http.get<any[]>(

      `${this.apiUrl}/users-per-day?t=${Date.now()}`,

      {
        headers:
          this.getHeaders()
      }

    );

  }


  /**
   * Get messages grouped by day.
   */
  getMessagesPerDay(): Observable<any[]> {

    return this.http.get<any[]>(

      `${this.apiUrl}/messages-per-day?t=${Date.now()}`,

      {
        headers:
          this.getHeaders()
      }

    );

  }


  /**
   * Get successful Pro conversions grouped by day.
   */
  getProConversions(): Observable<any[]> {

    return this.http.get<any[]>(

      `${this.apiUrl}/pro-conversions?t=${Date.now()}`,

      {
        headers:
          this.getHeaders()
      }

    );

  }


  /**
   * Get revenue grouped by day.
   */
  getRevenue(): Observable<any[]> {

    return this.http.get<any[]>(

      `${this.apiUrl}/revenue?t=${Date.now()}`,

      {
        headers:
          this.getHeaders()
      }

    );

  }


  /**
   * Get latest registered users.
   */
  getRecentUsers(): Observable<any[]> {

    return this.http.get<any[]>(

      `${this.apiUrl}/recent-users?t=${Date.now()}`,

      {
        headers:
          this.getHeaders()
      }

    );

  }

}