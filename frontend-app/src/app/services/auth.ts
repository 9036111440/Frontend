import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  verificationToken: string;
}

export interface RegisterResponse {
  message: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface LoginRequest {

    email: string;

    password: string;

}


export interface LoginResponse {

    message: string;

    accessToken: string;

    refreshToken: string;

    user: {

        id: string;

        firstName: string;

        lastName: string;

        email: string;

    };

}

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private readonly apiUrl = 'http://localhost:3000/api/auth';

  constructor(private http: HttpClient) {}

  sendOtp(email: string): Observable<any> {

    return this.http.post(
      `${this.apiUrl}/send-otp`,
      {
        email
      }
    );

  }


  verifyOtp(
    email: string,
    otp: string
  ): Observable<any> {

    return this.http.post(
      `${this.apiUrl}/verify-otp`,
      {
        email,
        otp
      }
    );

  }

  register(
    data: RegisterRequest
  ): Observable<RegisterResponse> {

    return this.http.post<RegisterResponse>(
      `${this.apiUrl}/register`,
      data
    );
  }
  
  login(
    data: LoginRequest
): Observable<LoginResponse> {

    return this.http.post<LoginResponse>(
        `${this.apiUrl}/login`,
        data,
        {
            withCredentials: true
        }
    );

}
}
