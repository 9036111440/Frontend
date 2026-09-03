import {
  Component
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
      Router

  ) {}


  // ===================================================
  // SEND OTP
  // ===================================================

  sendOtp(): void {

    this.errorMessage =
      '';

    this.successMessage =
      '';


    const email =
      this.email
        .trim();


    if (!email) {

      this.errorMessage =
        'Please enter your email address.';

      return;

    }


    this.isLoading =
      true;


    this.authService
      .forgotPassword(
        email
      )
      .pipe(

        finalize(() => {

          this.isLoading =
            false;

        })

      )
      .subscribe({

        next: (
          response
        ) => {

          this.step =
            2;

          this.successMessage =
            response.message;

        },


        error: (
          error
        ) => {

          console.error(
            'Forgot password error:',
            error
          );

          this.errorMessage =
            error.error?.message ||
            'Unable to send reset OTP.';

        }

      });

  }


  // ===================================================
  // VERIFY OTP
  // ===================================================

  verifyOtp(): void {

    this.errorMessage =
      '';

    this.successMessage =
      '';


    const email =
      this.email
        .trim();


    const otp =
      this.otp
        .trim();


    if (!otp) {

      this.errorMessage =
        'Please enter the OTP.';

      return;

    }


    this.isLoading =
      true;


    this.authService
      .verifyPasswordResetOtp(
        email,
        otp
      )
      .pipe(

        finalize(() => {

          this.isLoading =
            false;

        })

      )
      .subscribe({

        next: (
          response
        ) => {

          this.resetToken =
            response.resetToken;

          this.step =
            3;

          this.successMessage =
            'OTP verified successfully.';

        },


        error: (
          error
        ) => {

          console.error(
            'OTP verification error:',
            error
          );

          this.errorMessage =
            error.error?.message ||
            'Invalid or expired OTP.';

        }

      });

  }


  // ===================================================
  // RESET PASSWORD
  // ===================================================

  resetPassword(): void {

    this.errorMessage =
      '';

    this.successMessage =
      '';


    if (
      !this.newPassword ||
      !this.confirmPassword
    ) {

      this.errorMessage =
        'Please enter both password fields.';

      return;

    }


    if (
      this.newPassword !==
      this.confirmPassword
    ) {

      this.errorMessage =
        'Passwords do not match.';

      return;

    }


    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{9,}$/;


    if (
      !passwordRegex.test(
        this.newPassword
      )
    ) {

      this.errorMessage =
        'Password must contain at least 9 characters, one uppercase, one lowercase, one number and one special character.';

      return;

    }


    this.isLoading =
      true;


    this.authService
      .resetPassword(

        this.resetToken,

        this.newPassword,

        this.confirmPassword

      )
      .pipe(

        finalize(() => {

          this.isLoading =
            false;

        })

      )
      .subscribe({

        next: (
          response
        ) => {

          this.successMessage =
            response.message;

          this.step =
            1;

          this.otp =
            '';

          this.newPassword =
            '';

          this.confirmPassword =
            '';

        },


        error: (
          error
        ) => {

          console.error(
            'Password reset error:',
            error
          );

          this.errorMessage =
            error.error?.message ||
            'Unable to reset password.';

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