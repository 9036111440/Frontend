import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';

import {
    Component, ChangeDetectorRef
} from '@angular/core';

import { finalize } from 'rxjs';
import {
    NzIconModule
} from 'ng-zorro-antd/icon';

import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators
} from '@angular/forms';

import {
    Router, ActivatedRoute
} from '@angular/router';

import {
    NzFormModule
} from 'ng-zorro-antd/form';

import {
    NzInputModule
} from 'ng-zorro-antd/input';

import {
    NzButtonModule
} from 'ng-zorro-antd/button';

import {
    Auth
} from '../services/auth';


@Component({
    selector: 'app-login',

    standalone: true,

    imports: [
        CommonModule,
        ReactiveFormsModule,
        NzFormModule,
        NzInputModule,
        NzButtonModule,
        NzIconModule,
        RouterLink
    ],

    templateUrl: './login.html',

    styleUrl: './login.scss'
})
export class Login {

    loginForm: FormGroup;

    isLoading = false;


    constructor(
        private fb: FormBuilder,
        private authService: Auth,
        private router: Router,
        private route: ActivatedRoute,
        private notification: NzNotificationService,
        private cdr: ChangeDetectorRef
    ) {

        this.loginForm =
            this.fb.group({

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
                        Validators.required
                    ]
                ]

            });

    }

    goToForgotPassword(): void {

        this.router.navigate([
            '/forgot-password'
        ]);

    }

    submit(): void {

        if (this.loginForm.invalid) {

            this.loginForm.markAllAsTouched();

            this.cdr.detectChanges();

            return;
        }

        this.isLoading = true;

        this.cdr.detectChanges();


        const loginData = {

            email:
                this.loginForm.value.email,

            password:
                this.loginForm.value.password

        };


        this.authService
            .login(loginData)
            .pipe(

                finalize(() => {

                    this.isLoading = false;

                    this.cdr.detectChanges();

                })

            )
            .subscribe({

                next: (response: any) => {

                    console.log(
                        'Login successful',
                        response
                    );


                    // -----------------------
                    // Store tokens
                    // -----------------------

                    localStorage.setItem(
                        'accessToken',
                        response.accessToken
                    );

                    localStorage.setItem(
                        'refreshToken',
                        response.refreshToken
                    );


                    // -----------------------
                    // Store user information
                    // -----------------------

                    localStorage.setItem(
                        'user',
                        JSON.stringify(
                            response.user
                        )
                    );


                    this.cdr.detectChanges();


                    // -----------------------
                    // Navigate dashboard
                    // -----------------------

 const returnUrl =
    this.getSafeReturnUrl();


this.router.navigateByUrl(
    returnUrl
);

                },


                error: (error: any) => {

                    console.error(
                        'Login failed',
                        error
                    );


                    this.notification.error(
                        'Invalid email or password',
                        'Please check your credentials and try again.'
                    );


                    this.cdr.detectChanges();

                }

            });

    }

    // =====================================================
// GET SAFE RETURN URL
// =====================================================

private getSafeReturnUrl(): string {

    const returnUrl =
        this.route.snapshot.queryParamMap.get(
            'returnUrl'
        );


    // -----------------------------------------------
    // No return URL
    // -----------------------------------------------

    if (!returnUrl) {

        return '/dashboard';

    }


    // -----------------------------------------------
    // Only allow internal application paths
    // -----------------------------------------------

    if (
        !returnUrl.startsWith('/')
    ) {

        return '/dashboard';

    }


    // Prevent protocol-relative URLs
    // such as //evil-site.com

    if (
        returnUrl.startsWith('//')
    ) {

        return '/dashboard';

    }


    return returnUrl;

}
}