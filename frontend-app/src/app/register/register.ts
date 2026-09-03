import { CommonModule } from '@angular/common';
import { Component ,ChangeDetectorRef } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';

import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { Auth, RegisterRequest } from '../services/auth';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    RouterLink
  ],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {

  registerForm: FormGroup;

  isLoading = false;
  emailOtpSent = false;
  emailVerified = false;
  isSendingOtp = false;
  isVerifyingOtp = false;
  verificationToken = '';

  constructor(
    private fb: FormBuilder,
    private authService: Auth,
    private cdr: ChangeDetectorRef,
    private notification: NzNotificationService
  ) {

    this.registerForm = this.fb.group(
      {
        firstName: [
          '',
          [
            Validators.required,
            Validators.minLength(2)
          ]
        ],

        lastName: [
          '',
          [
            Validators.required,
            Validators.minLength(2)
          ]
        ],

        email: [
          '',
          [
            Validators.required,
            Validators.email
          ]
        ],

        password: [
          '',
          [
            Validators.required,
            Validators.minLength(9),
            Validators.pattern(
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/
            )
          ]
        ],
        otp: [
          '',
          [
            Validators.required,
            Validators.pattern(/^\d{6}$/)
          ]
        ],

        confirmPassword: [
          '',
          [
            Validators.required
          ]
        ]
      },
      {
        validators: this.passwordMatchValidator()
      }
    );
  }


  passwordMatchValidator(): ValidatorFn {

    return (
      control: AbstractControl
    ): ValidationErrors | null => {

      const password =
        control.get('password')?.value;

      const confirmPassword =
        control.get('confirmPassword')?.value;

      if (!password || !confirmPassword) {
        return null;
      }

      return password === confirmPassword
        ? null
        : { passwordMismatch: true };
    };
  }


submit(): void {

  if (!this.emailVerified) {

    alert(
      'Please verify your email before registering'
    );

    return;
  }

  if (this.registerForm.invalid) {

    this.registerForm.markAllAsTouched();

    this.cdr.detectChanges();

    return;
  }

  const formValue =
    this.registerForm.getRawValue();

  const formData: RegisterRequest = {

    firstName:
      formValue.firstName,

    lastName:
      formValue.lastName,

    email:
      formValue.email,

    password:
      formValue.password,

    confirmPassword:
      formValue.confirmPassword,

    verificationToken:
      this.verificationToken

  };

  this.isLoading = true;

  this.cdr.detectChanges();

  this.authService
    .register(formData)
    .pipe(
      finalize(() => {

        this.isLoading = false;

        this.cdr.detectChanges();

      })
    )
    .subscribe({

      next: (response) => {

        console.log(
          'Registration successful:',
          response
        );

        this.registerForm.reset();

        this.emailOtpSent = false;

        this.emailVerified = false;

        this.verificationToken = '';

        this.cdr.detectChanges();

        alert(
          'Registration successful!'
        );

      },

      error: (error) => {

        console.error(
          'Registration failed:',
          error
        );

        this.cdr.detectChanges();

        alert(
          error.error?.message ||
          'Registration failed'
        );

      }

    });

}

sendOtp(): void {

  const emailControl =
    this.registerForm.get('email');

  if (
    !emailControl ||
    emailControl.invalid
  ) {

    emailControl?.markAsTouched();

    this.cdr.detectChanges();

    return;
  }

  const email =
    emailControl.value;

  this.isSendingOtp = true;

  this.cdr.detectChanges();

  this.authService
    .sendOtp(email)
    .pipe(
      finalize(() => {

        this.isSendingOtp = false;

        this.cdr.detectChanges();

      })
    )
    .subscribe({

      next: (response) => {

        console.log(
          'OTP sent:',
          response
        );

        this.emailOtpSent = true;

        this.emailVerified = false;

        this.cdr.detectChanges();

this.notification.success(
  'OTP Sent',
  'A verification code has been sent to your email address.'
);

      },

      error: (error) => {

        console.error(
          'Send OTP failed:',
          error
        );

        this.cdr.detectChanges();

        alert(
          error.error?.message ||
          'Failed to send OTP'
        );

      }

    });
}

verifyOtp(): void {

  const emailControl =
    this.registerForm.get('email');

  const otpControl =
    this.registerForm.get('otp');

  if (
    !emailControl ||
    emailControl.invalid
  ) {

    emailControl?.markAsTouched();

    this.cdr.detectChanges();

    return;
  }

  if (
    !otpControl ||
    otpControl.invalid
  ) {

    otpControl?.markAsTouched();

    this.cdr.detectChanges();

    return;
  }

  const email =
    emailControl.value;

  const otp =
    otpControl.value;

  this.isVerifyingOtp = true;

  this.cdr.detectChanges();

  this.authService
    .verifyOtp(email, otp)
    .pipe(
      finalize(() => {

        this.isVerifyingOtp = false;

        this.cdr.detectChanges();

      })
    )
    .subscribe({

      next: (response) => {

        console.log(
          'OTP verified:',
          response
        );

        this.emailVerified = true;

        this.verificationToken =
          response.verificationToken;

        this.registerForm
          .get('email')
          ?.disable();

        this.registerForm
          .get('otp')
          ?.disable();

        this.cdr.detectChanges();

this.notification.success(
  'Email Verified',
  'Your email address has been successfully verified.'
);

      },

      error: (error) => {

        console.error(
          'OTP verification failed:',
          error
        );

        this.emailVerified = false;

        this.cdr.detectChanges();

this.notification.error(
  'Unable to Send OTP',
  error.error?.message ||
  'Please try again.'
);

      }

    });
}
}
