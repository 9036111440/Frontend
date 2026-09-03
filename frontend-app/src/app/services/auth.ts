import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

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
  private readonly apiUrl = `${environment.apiUrl}/auth`;

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

logout(): Observable<any> {

  return this.http.post(

    `${environment.apiUrl}/auth/logout`,

    {},

    {
      withCredentials: true
    }

  );

}

clearAuthData(): void {

  localStorage.removeItem(
    'accessToken'
  );

  localStorage.removeItem(
    'refreshToken'
  );

  localStorage.removeItem(
    'user'
  );

}

// =====================================================
// FORGOT PASSWORD
// =====================================================

forgotPassword(
  email: string
) {

  return this.http.post<{
    message: string;
  }>(
    `${this.apiUrl}/forgot-password`,
    {
      email
    }
  );

}


// =====================================================
// VERIFY PASSWORD RESET OTP
// =====================================================

verifyPasswordResetOtp(
  email: string,
  otp: string
) {

  return this.http.post<{
    message: string;
    resetToken: string;
  }>(
    `${this.apiUrl}/verify-password-reset-otp`,
    {
      email,
      otp
    }
  );

}


// =====================================================
// RESET PASSWORD
// =====================================================

resetPassword(
  resetToken: string,
  newPassword: string,
  confirmPassword: string
) {

  return this.http.post<{
    message: string;
  }>(
    `${this.apiUrl}/reset-password`,
    {
      resetToken,
      newPassword,
      confirmPassword
    }
  );

}


}
