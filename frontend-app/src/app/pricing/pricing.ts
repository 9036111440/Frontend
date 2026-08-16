import {
  Component
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

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

  standalone: true,

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


  isLoading =
    false;


  constructor(

    private paymentService:
      PaymentService,

    private message:
      NzMessageService

  ) {}


  upgradeToPro(): void {

    this.isLoading =
      true;


    this.paymentService
      .createOrder()
      .subscribe({

        next: (order) => {

          this.isLoading =
            false;


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


            handler:
              (response: any) => {

                this.verifyPayment(
                  response
                );

              },


            prefill: {

              name:
                'Praveen Kumar',

              email:
                'praveen@example.com'

            },


            theme: {

              color:
                '#1677ff'

            }

          };


          const razorpay =
            new Razorpay(
              options
            );


          razorpay.on(
            'payment.failed',
            (response: any) => {

              console.error(
                'Payment failed:',
                response
              );


              this.message.error(
                'Payment failed'
              );

            }
          );


          razorpay.open();

        },


        error: (error) => {

          this.isLoading =
            false;


          console.error(
            error
          );


          this.message.error(
            error.error?.message ||
            'Unable to start payment'
          );

        }

      });

  }


  verifyPayment(
    response: any
  ): void {

    this.paymentService
      .verifyPayment(
        response
      )
      .subscribe({

        next: (result) => {

          console.log(
            'Payment verified:',
            result
          );


          this.message.success(
            '🎉 Pro plan activated!'
          );


          // Later navigate back
          // to dashboard

        },


        error: (error) => {

          console.error(
            error
          );


          this.message.error(
            'Payment verification failed'
          );

        }

      });

  }

}