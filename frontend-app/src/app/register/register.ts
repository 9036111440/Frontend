import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
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
    private authService: Auth
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


    this.authService
        .register(formData)
        .subscribe({

            next: (response) => {

                this.isLoading = false;

                console.log(
                    'Registration successful:',
                    response
                );

                alert(
                    'Registration successful!'
                );

                this.registerForm.reset();

                this.emailOtpSent = false;

                this.emailVerified = false;

                this.verificationToken = '';

            },


            error: (error) => {

                this.isLoading = false;

                console.error(
                    'Registration failed:',
                    error
                );

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

        return;

    }


    const email =
        emailControl.value;


    this.isSendingOtp = true;


    this.authService
        .sendOtp(email)
        .subscribe({

            next: (response) => {

                console.log(
                    'OTP sent:',
                    response
                );

                this.isSendingOtp = false;

                this.emailOtpSent = true;

                this.emailVerified = false;

                alert(
                    'OTP sent to your email'
                );

            },

            error: (error) => {

                console.error(
                    'Send OTP failed:',
                    error
                );

                this.isSendingOtp = false;

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

        return;

    }


    if (
        !otpControl ||
        otpControl.invalid
    ) {

        otpControl?.markAsTouched();

        return;

    }


    const email =
        emailControl.value;

    const otp =
        otpControl.value;


    this.isVerifyingOtp = true;


    this.authService
        .verifyOtp(email, otp)
        .subscribe({

            next: (response) => {

                console.log(
                    'OTP verified:',
                    response
                );


                this.isVerifyingOtp = false;

                this.emailVerified = true;

                this.verificationToken =
                    response.verificationToken;


                this.registerForm
                    .get('email')
                    ?.disable();


                this.registerForm
                    .get('otp')
                    ?.disable();


                alert(
                    'Email verified successfully!'
                );

            },


            error: (error) => {

                console.error(
                    'OTP verification failed:',
                    error
                );


                this.isVerifyingOtp = false;

                this.emailVerified = false;


                alert(
                    error.error?.message ||
                    'Invalid OTP'
                );

            }

        });

}
}
