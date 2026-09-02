import {
  Component,
  ChangeDetectorRef,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  Chatservice
} from '../services/chatservice';

import {
  NzButtonModule
} from 'ng-zorro-antd/button';

import {
  NzInputModule
} from 'ng-zorro-antd/input';

import {
  NzIconModule
} from 'ng-zorro-antd/icon';

import {
  finalize
} from 'rxjs';

import {
  Router
} from '@angular/router';

import {
  Auth
} from '../services/auth';


interface ChatMessage {

  role:
    | 'user'
    | 'assistant';

  content: string;

  attachment?: any;

}


interface Conversation {

  id: string;

  title: string;

  updatedAt: string;

  messageCount: number;

}


/*
 * ==========================================
 * USER
 * ==========================================
 */

interface User {

  id: string;

  firstName: string;

  lastName: string;

  email: string;

  plan: 'demo' | 'pro';

  role: 'user' | 'admin';

}


@Component({

  selector:
    'app-dashboard',

  standalone: true,

  imports: [

    CommonModule,

    FormsModule,

    NzButtonModule,

    NzInputModule,

    NzIconModule

  ],

  templateUrl:
    './dashboard.html',

  styleUrl:
    './dashboard.scss'

})


export class Dashboard
  implements OnInit {


  message = '';

  selectedFile:
    | File
    | null = null;


  isLoading =
    false;


  conversationId:
    | string
    | undefined;


  conversations:
    Conversation[] = [];


  messages:
    ChatMessage[] = [];


  /*
   * ==========================================
   * LOGGED-IN USER
   * ==========================================
   */

  user:
    User
    | null = null;


  /*
   * Profile menu
   */

  showUserMenu =
    false;


  constructor(

    private chatService:
      Chatservice,

    private cdr:
      ChangeDetectorRef,

    private authService:
      Auth,

    private router:
      Router

  ) {}


  ngOnInit(): void {

    this.loadUser();

    this.loadConversations();

  }


  /*
   * ==========================================
   * LOAD USER
   * ==========================================
   */

  loadUser(): void {

    const userJson =
      localStorage.getItem(
        'user'
      );


    if (!userJson) {

      this.user =
        null;

      return;

    }


    try {

      this.user =
        JSON.parse(
          userJson
        );

      console.log(
        'Logged-in user:',
        this.user
      );

    }

    catch (error) {

      console.error(
        'Failed to parse user:',
        error
      );

      this.user =
        null;

    }

  }


  /*
   * ==========================================
   * USER NAME
   * ==========================================
   */

  get fullName(): string {

    if (!this.user) {

      return 'User';

    }


    return (

      `${this.user.firstName || ''} ` +

      `${this.user.lastName || ''}`

    ).trim();

  }


  /*
   * ==========================================
   * INITIALS
   * ==========================================
   */

  get userInitials(): string {

    if (!this.user) {

      return 'U';

    }


    const first =
      this.user.firstName
        ?.charAt(0)
        .toUpperCase() || '';


    const last =
      this.user.lastName
        ?.charAt(0)
        .toUpperCase() || '';


    return (
      first + last
    ) || 'U';

  }


  /*
   * ==========================================
   * PLAN
   * ==========================================
   */

  get isPro(): boolean {

    return this.user?.plan === 'pro';

  }

  get isAdmin(): boolean {

  return this.user?.role === 'admin';

}


  /*
   * ==========================================
   * TOGGLE USER MENU
   * ==========================================
   */

  toggleUserMenu(): void {

    this.showUserMenu =
      !this.showUserMenu;

  }


  /*
   * ==========================================
   * CLOSE USER MENU
   * ==========================================
   */

  closeUserMenu(): void {

    this.showUserMenu =
      false;

  }


  /*
   * ==========================================
   * UPGRADE
   * ==========================================
   */

  upgradeToPro(): void {

    this.closeUserMenu();


    this.router.navigate([
      '/pricing'
    ]);

  }

  /*
 * ==========================================
 * ADMIN PANEL
 * ==========================================
 */

openAdminPanel(): void {

  this.closeUserMenu();

  this.router.navigate([
    '/admin'
  ]);

}


  /*
   * ==========================================
   * CONVERSATIONS
   * ==========================================
   */

  loadConversations(): void {

    this.chatService

      .getConversations()

      .subscribe({

        next: (data: any) => {

          this.conversations =
            data;

          this.isLoading =
            false;

          this.cdr.markForCheck();

        },

        error: (error: any) => {

          console.error(
            error
          );

          this.cdr.markForCheck();

        }

      });

  }


  /*
   * ==========================================
   * FILE
   * ==========================================
   */

  selectFile(
    event: Event
  ): void {

    const input =
      event.target as
        HTMLInputElement;


    if (
      input.files &&
      input.files.length > 0
    ) {

      this.selectedFile =
        input.files[0];

    }

  }


  removeFile(): void {

    this.selectedFile =
      null;

  }


  /*
   * ==========================================
   * SEND MESSAGE
   * ==========================================
   */

  sendMessage(): void {


    const message =
      this.message.trim();


    const file =
      this.selectedFile;


    this.message =
      '';

    this.selectedFile =
      null;


    if (
      !message &&
      !file
    ) {

      return;

    }


    this.messages.push({

      role:
        'user',

      content:
        message ||
        file?.name ||
        'Attachment'

    });


    this.isLoading =
      true;


    this.cdr.markForCheck();


    this.chatService

      .sendMessage(

        message,

        this.conversationId,

        file ||
        undefined

      )

      .pipe(

        finalize(() => {

          this.isLoading =
            false;

          this.cdr.markForCheck();

        })

      )

      .subscribe({

        next: (response) => {

          console.log(
            'Chat response:',
            response
          );


          this.conversationId =
            response.conversationId;


          this.messages.push({

            role:
              'assistant',

            content:
              response
                .assistantMessage
                .content

          });


          this.isLoading =
            false;


          this.cdr.markForCheck();


          this.loadConversations();

        },


        error: (error) => {

          console.error(
            'Chat API error:',
            error
          );


          this.isLoading =
            false;


          if (

            error.status === 403 &&

            error.error?.code ===
              'CHAT_LIMIT_REACHED'

          ) {

            this.messages.push({

              role:
                'assistant',

              content:
                'You have reached the 3-message Demo limit for this conversation. Please upgrade to Pro for unlimited chats.'

            });


            this.cdr.markForCheck();

            return;

          }


          this.messages.push({

            role:
              'assistant',

            content:
              'Sorry, something went wrong while processing your request.'

          });


          this.cdr.markForCheck();

        }

      });

  }


  /*
   * ==========================================
   * OPEN CONVERSATION
   * ==========================================
   */

  openConversation(
    conversation: Conversation
  ): void {

    this.isLoading =
      false;


    this.conversationId =
      conversation.id;


    this.chatService

      .getConversation(
        conversation.id
      )

      .pipe(

        finalize(() => {

          this.isLoading =
            false;

          this.cdr.markForCheck();

        })

      )

      .subscribe({

        next: (data: any) => {

          this.messages =
            data.messages;

          this.isLoading =
            false;

          this.cdr.markForCheck();

        },

        error: (error: any) => {

          console.error(
            error
          );

          this.isLoading =
            false;

          this.cdr.markForCheck();

        }

      });

  }


  /*
   * ==========================================
   * NEW CHAT
   * ==========================================
   */

  newChat(): void {

    this.isLoading =
      false;


    this.conversationId =
      undefined;


    this.messages =
      [];


    this.message =
      '';


    this.selectedFile =
      null;


    this.cdr.markForCheck();

  }


  /*
   * ==========================================
   * LOGOUT
   * ==========================================
   */

  logout(): void {

    this.closeUserMenu();


    this.authService

      .logout()

      .subscribe({

        next: () => {

          console.log(
            'Logout successful'
          );


          this.clearLocalAuth();

        },


        error: (error) => {

          console.error(
            'Logout API error:',
            error
          );


          this.clearLocalAuth();

        }

      });

  }


  private clearLocalAuth(): void {

    localStorage.removeItem(
      'accessToken'
    );


    localStorage.removeItem(
      'refreshToken'
    );


    localStorage.removeItem(
      'user'
    );


    this.router.navigate([
      '/login'
    ]);

  }

}