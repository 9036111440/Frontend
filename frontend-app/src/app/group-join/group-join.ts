import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  GroupChatService
} from '../services/group-chat.service';

import {
  finalize
} from 'rxjs';


@Component({

  selector:
    'app-group-join',

  standalone:
    true,

  imports: [
    CommonModule
  ],

  templateUrl:
    './group-join.html',

  styleUrl:
    './group-join.scss'

})


export class GroupJoin
  implements OnInit {


  // ===================================================
  // INVITE TOKEN
  // ===================================================

  token =
    '';


  // ===================================================
  // STATE
  // ===================================================

  isJoining =
    false;

  isJoined =
    false;

  errorMessage =
    '';

  groupTitle =
    '';


  // ===================================================
  // CONSTRUCTOR
  // ===================================================

  constructor(

    private route:
      ActivatedRoute,

    private router:
      Router,

    private groupChatService:
      GroupChatService,

    private cdr:
      ChangeDetectorRef

  ) {}


  // ===================================================
  // INIT
  // ===================================================

  ngOnInit(): void {

    this.token =
      this.route.snapshot.paramMap.get(
        'token'
      ) || '';


    if (!this.token) {

      this.errorMessage =
        'Invalid invitation link.';

      this.cdr.markForCheck();

      return;

    }

  }


  // ===================================================
  // JOIN GROUP
  // ===================================================

  joinGroup(): void {

    if (
      !this.token ||
      this.isJoining
    ) {

      return;

    }


    const accessToken =
      localStorage.getItem(
        'accessToken'
      );


    // -----------------------------------------------
    // User must be logged in
    // -----------------------------------------------

    if (!accessToken) {

      this.errorMessage =
        'Please log in before joining this group.';


      this.cdr.markForCheck();


      // Save invite URL so login can return here
      const currentUrl =
        this.router.url;


      this.router.navigate(
        ['/login'],
        {
          queryParams: {
            returnUrl:
              currentUrl
          }
        }
      );


      return;

    }


    this.isJoining =
      true;

    this.errorMessage =
      '';


    this.cdr.markForCheck();


    this.groupChatService
      .joinGroupByInviteToken(
        this.token
      )
      .pipe(

        finalize(() => {

          this.isJoining =
            false;

          this.cdr.markForCheck();

        })

      )
      .subscribe({

        next: (
          response
        ) => {

          console.log(
            '✅ Joined group:',
            response
          );


          this.groupTitle =
            response.title ||
            'Group Chat';


          this.isJoined =
            true;


          this.cdr.markForCheck();


          // -----------------------------------------
          // Go to dashboard after short delay
          // -----------------------------------------

          setTimeout(() => {

            this.router.navigate(
              ['/dashboard']
            );

          }, 900);

        },


        error: (
          error
        ) => {

          console.error(
            '❌ Join group failed:',
            error
          );


          if (
            error.status ===
            401
          ) {

            this.errorMessage =
              'Your login session has expired. Please log in again.';

          }

          else if (
            error.status ===
            400
          ) {

            this.errorMessage =
              error.error?.message ||
              'This invitation is invalid or has expired.';

          }

          else {

            this.errorMessage =
              error.error?.message ||
              'Unable to join this group.';

          }


          this.cdr.markForCheck();

        }

      });

  }


  // ===================================================
  // GO TO LOGIN
  // ===================================================

  goToLogin(): void {

    this.router.navigate(
      ['/login'],
      {
        queryParams: {
          returnUrl:
            this.router.url
        }
      }
    );

  }


  // ===================================================
  // GO TO DASHBOARD
  // ===================================================

  goToDashboard(): void {

    this.router.navigate(
      ['/dashboard']
    );

  }

}