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

@Component({
  selector: 'app-register',
 standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule
  ],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  
 registerForm: FormGroup;

  isLoading = false;

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

    if (this.registerForm.invalid) {

      this.registerForm.markAllAsTouched();

      return;
    }

    const formData: RegisterRequest =
      this.registerForm.value;

    console.log('Sending data:', formData);

    this.isLoading = true;

    this.authService.register(formData)
      .subscribe({

        next: (response:any) => {

          console.log(
            'Registration successful:',
            response
          );

          this.isLoading = false;

          alert('Registration successful!');

          this.registerForm.reset();
        },

        error: (error:any) => {

          console.error(
            'Registration failed:',
            error
          );

          this.isLoading = false;

          if (error.status === 409) {

            alert('Email already registered');

          } else if (error.status === 400) {

            alert(
              error.error?.message ||
              'Invalid registration details'
            );

          } else {

            alert(
              'Something went wrong. Please try again.'
            );
          }
        }

      });
  }
}
