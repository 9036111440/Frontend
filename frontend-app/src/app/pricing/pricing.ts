import {
  Component
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  Router
} from '@angular/router';

import {
  NzButtonModule
} from 'ng-zorro-antd/button';

import {
  NzCardModule
} from 'ng-zorro-antd/card';

import {
  NzTagModule
} from 'ng-zorro-antd/tag';

import {
  NzMessageService
} from 'ng-zorro-antd/message';

import {
  PaymentService
} from '../services/payment-service';


declare var Razorpay: any;


@Component({

  selector:
    'app-pricing',

  standalone:
    true,

  imports: [

    CommonModule,

    NzButtonModule,

    NzCardModule,

    NzTagModule

  ],

  templateUrl:
    './pricing.html',

  styleUrl:
    './pricing.scss'

})
export class Pricing {


  // =====================================================
  // STATE
  // =====================================================

  isLoading =
    false;


  constructor(

    private paymentService:
      PaymentService,

    private message:
      NzMessageService,

    private router:
      Router

  ) {}


  // =====================================================
  // UPGRADE TO PRO
  // =====================================================

  upgradeToPro(): void {

    /*
     * Start loading while we create the
     * Razorpay order.
     */

    this.isLoading =
      true;


    this.paymentService

      .createOrder()

      .subscribe({

        // ===============================================
        // CREATE ORDER SUCCESS
        // ===============================================

        next: (order) => {

          /*
           * Order creation is complete.
           *
           * Stop the Angular button loading.
           *
           * Razorpay popup will handle the payment UI.
           */

          this.isLoading =
            false;


          /*
           * Get the logged-in user's information
           * for Razorpay prefill.
           */

          const user =
            this.getLocalUser();


          const customerName =

            user

              ? `${user.firstName || ''} ${user.lastName || ''}`.trim()

              : 'AI Chat User';


          const customerEmail =

            user?.email ||

            '';


          // =============================================
          // RAZORPAY OPTIONS
          // =============================================

          const options = {

            key:
              order.keyId,

            amount:
              order.amount,

            currency:
              order.currency,

            name:
              'AI Chatbot',

            description:
              'AI Chatbot Pro Plan',

            order_id:
              order.orderId,


            // =========================================
            // PAYMENT SUCCESS
            // =========================================

            handler:
              (response: any) => {

                console.log(
                  '✅ Razorpay payment success:',
                  response
                );


                this.verifyPayment(
                  response
                );

              },


            // =========================================
            // CUSTOMER DETAILS
            // =========================================

            prefill: {

              name:
                customerName,

              email:
                customerEmail

            },


            // =========================================
            // THEME
            // =========================================

            theme: {

              color:
                '#1677ff'

            }

          };


          // =============================================
          // CREATE RAZORPAY INSTANCE
          // =============================================

          const razorpay =
            new Razorpay(
              options
            );


          // =============================================
          // PAYMENT FAILED
          // =============================================

          razorpay.on(

            'payment.failed',

            (response: any) => {

              console.error(
                '❌ Razorpay payment failed:',
                response
              );


              this.isLoading =
                false;


              const errorMessage =

                response
                  ?.error
                  ?.description ||

                'Payment failed. Please try again.';


              this.message.error(
                errorMessage
              );


              /*
               * Stay on pricing page.
               */

              this.router.navigate([
                '/pricing'
              ]);

            }

          );


          // =============================================
          // OPEN RAZORPAY
          // =============================================

          razorpay.open();

        },


        // ===============================================
        // CREATE ORDER FAILED
        // ===============================================

        error: (error) => {

          console.error(
            '❌ Create order failed:',
            error
          );


          this.isLoading =
            false;


          this.message.error(

            error
              ?.error
              ?.message ||

            'Unable to start payment. Please try again.'

          );


          /*
           * Keep user on pricing page.
           */

          this.router.navigate([
            '/pricing'
          ]);

        }

      });

  }


  // =====================================================
  // VERIFY PAYMENT WITH BACKEND
  // =====================================================

  verifyPayment(
    response: any
  ): void {

    /*
     * IMPORTANT:
     *
     * Razorpay success does NOT mean our application
     * should immediately activate Pro.
     *
     * First we send the Razorpay response to Node.js.
     */

    this.isLoading =
      true;


    this.paymentService

      .verifyPayment(
        response
      )

      .subscribe({

        // =============================================
        // BACKEND VERIFICATION SUCCESS
        // =============================================

        next: (result) => {

          console.log(
            '✅ Payment verified by backend:',
            result
          );


          /*
           * Backend should have already updated
           * MongoDB:
           *
           * user.plan = "pro"
           *
           * Now update the frontend's local copy.
           */

          this.updateLocalUserPlan(
            result
          );


          this.isLoading =
            false;


          this.message.success(
            '🎉 Pro plan activated successfully!'
          );


          /*
           * Give the user a short moment to see
           * the success message, then navigate.
           */

          setTimeout(() => {

            this.router.navigate([
              '/dashboard'
            ]);

          }, 800);

        },


        // =============================================
        // BACKEND VERIFICATION FAILED
        // =============================================

        error: (error) => {

          console.error(
            '❌ Payment verification failed:',
            error
          );


          this.isLoading =
            false;


          this.message.error(

            error
              ?.error
              ?.message ||

            'Payment verification failed. Please try again.'

          );


          /*
           * Payment was not successfully verified.
           *
           * Do NOT mark the user as Pro.
           *
           * Stay on pricing page.
           */

          this.router.navigate([
            '/pricing'
          ]);

        }

      });

  }


  // =====================================================
  // GET LOCAL USER
  // =====================================================

  private getLocalUser(): any {

    const userJson =
      localStorage.getItem(
        'user'
      );


    if (!userJson) {

      return null;

    }


    try {

      return JSON.parse(
        userJson
      );

    }

    catch (error) {

      console.error(
        'Unable to parse local user:',
        error
      );


      return null;

    }

  }


  // =====================================================
  // UPDATE LOCAL USER PLAN
  // =====================================================

  private updateLocalUserPlan(
    result: any
  ): void {

    /*
     * First try to use the user returned
     * by the backend.
     *
     * Example backend response:
     *
     * {
     *   message: "Payment verified",
     *   user: {
     *     plan: "pro"
     *   }
     * }
     */

    if (
      result?.user
    ) {

      localStorage.setItem(

        'user',

        JSON.stringify(
          result.user
        )

      );


      console.log(
        '✅ Local user updated from backend response'
      );


      return;

    }


    /*
     * If your current backend does NOT return
     * the user object, update only the plan
     * in the existing localStorage user.
     */

    const user =
      this.getLocalUser();


    if (!user) {

      console.warn(
        'No local user found'
      );

      return;

    }


    user.plan =
      'pro';


    localStorage.setItem(

      'user',

      JSON.stringify(
        user
      )

    );


    console.log(
      '✅ Local user plan updated to PRO'
    );

  }

}