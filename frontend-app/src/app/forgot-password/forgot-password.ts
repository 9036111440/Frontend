import {
  Component,
  ChangeDetectorRef
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  Router
} from '@angular/router';

import {
  NzInputModule
} from 'ng-zorro-antd/input';

import {
  NzButtonModule
} from 'ng-zorro-antd/button';

import {
  NzIconModule
} from 'ng-zorro-antd/icon';

import {
  finalize
} from 'rxjs';

import {
  Auth
} from '../services/auth';


@Component({

  selector:
    'app-forgot-password',

  standalone:
    true,

  imports: [

    CommonModule,

    FormsModule,

    NzInputModule,

    NzButtonModule,

    NzIconModule

  ],

  templateUrl:
    './forgot-password.html',

  styleUrl:
    './forgot-password.scss'

})
export class ForgotPassword {

  // ===================================================
  // STEP
  // ===================================================

  step:
    1 | 2 | 3 = 1;


  // ===================================================
  // FORM DATA
  // ===================================================

  email =
    '';

  otp =
    '';

  newPassword =
    '';

  confirmPassword =
    '';

  resetToken =
    '';


  // ===================================================
  // UI
  // ===================================================

  isLoading =
    false;

  errorMessage =
    '';

  successMessage =
    '';


  constructor(

    private authService:
      Auth,

    private router:
      Router,
    
    private cdr: ChangeDetectorRef

  ) {}


  // ===================================================
  // SEND OTP
  // ===================================================

sendOtp(): void {

    if (!this.email) {
        this.errorMessage = 'Please enter your email address.';
        this.cdr.detectChanges();
        return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.cdr.detectChanges();

    this.authService
        .forgotPassword(this.email)
        .pipe(
            finalize(() => {
                this.isLoading = false;
                this.cdr.detectChanges();
            })
        )
        .subscribe({
            next: (response: any) => {

                this.successMessage =
                    response.message ||
                    'OTP sent successfully.';

                this.step = 2;

                this.cdr.detectChanges();
            },

            error: (error: any) => {

                this.errorMessage =
                    error.error?.message ||
                    'Unable to send OTP. Please try again.';

                this.cdr.detectChanges();
            }
        });
}


  // ===================================================
  // VERIFY OTP
  // ===================================================

verifyOtp(): void {

    if (!this.otp || this.otp.length !== 6) {
        this.errorMessage = 'Please enter the 6-digit OTP.';
        this.cdr.detectChanges();
        return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.cdr.detectChanges();

    this.authService
        .verifyPasswordResetOtp(
            this.email,
            this.otp
        )
        .pipe(
            finalize(() => {
                this.isLoading = false;
                this.cdr.detectChanges();
            })
        )
        .subscribe({
            next: (response: any) => {

                this.resetToken =
                    response.resetToken;

                this.successMessage =
                    response.message ||
                    'OTP verified successfully.';

                this.step = 3;

                this.cdr.detectChanges();
            },

            error: (error: any) => {

                this.errorMessage =
                    error.error?.message ||
                    'Invalid or expired OTP.';

                this.cdr.detectChanges();
            }
        });
}


  // ===================================================
  // RESET PASSWORD
  // ===================================================

resetPassword(): void {

    if (!this.newPassword ||
        !this.confirmPassword) {

        this.errorMessage =
            'Please enter and confirm your password.';

        this.cdr.detectChanges();
        return;
    }

    if (this.newPassword !== this.confirmPassword) {

        this.errorMessage =
            'Passwords do not match.';

        this.cdr.detectChanges();
        return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.cdr.detectChanges();

    this.authService
        .resetPassword(
            this.resetToken,
            this.newPassword,
            this.confirmPassword
        )
        .pipe(
            finalize(() => {
                this.isLoading = false;
                this.cdr.detectChanges();
            })
        )
        .subscribe({
            next: (response: any) => {

                this.successMessage =
                    response.message ||
                    'Password reset successfully.';

                this.cdr.detectChanges();

                setTimeout(() => {
                    this.router.navigate([
                        '/login'
                    ]);
                }, 1500);
            },

            error: (error: any) => {

                this.errorMessage =
                    error.error?.message ||
                    'Unable to reset password.';

                this.cdr.detectChanges();
            }
        });
}


  // ===================================================
  // BACK TO LOGIN
  // ===================================================

  goToLogin(): void {

    this.router.navigate([
      '/login'
    ]);

  }

}