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
import { RouterLink } from '@angular/router';

import { finalize } from 'rxjs';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  attachment?: any;
}

interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
  messageCount: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzInputModule,
    NzIconModule,
    RouterLink
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  message = '';
  selectedFile: File | null = null;
  isLoading = false;
  conversationId: string | undefined;
  conversations: Conversation[] = [];
  messages: ChatMessage[] = [];

  constructor(
    private chatService: Chatservice,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadConversations();
  }

  loadConversations(): void {
    this.chatService
      .getConversations()
      .subscribe({
        next: (data: any) => {
          this.conversations = data;
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: (error: any) => {
          console.error(error);
          this.cdr.markForCheck();
        }
      });
  }

  selectFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  removeFile(): void {
    this.selectedFile = null;
  }

sendMessage(): void {

  // Get the message and file first
  const message = this.message.trim();
  const file = this.selectedFile;

  // Clear input immediately
  this.message = '';
  this.selectedFile = null;

  // If nothing to send, return
  if (!message && !file) {
    return;
  }

  // Add user message
  this.messages.push({
    role: 'user',
    content: message || file?.name || 'Attachment'
  });

  // Start loading
  this.isLoading = true;
  this.cdr.markForCheck();


  this.chatService
    .sendMessage(
      message,
      this.conversationId,
      file || undefined
    )
    .pipe(
      finalize(() => {

        this.isLoading = false;

        this.cdr.markForCheck();

      })
    )
    .subscribe({

      // =================================
      // SUCCESS
      // =================================

      next: (response) => {

        console.log(
          'Chat response:',
          response
        );


        this.conversationId =
          response.conversationId;


        this.messages.push({

          role: 'assistant',

          content:
            response.assistantMessage.content

        });


        this.isLoading = false;

        this.cdr.markForCheck();


        // Refresh recent conversations
        this.loadConversations();

      },


      // =================================
      // ERROR
      // =================================

      error: (error) => {

        console.error(
          'Chat API error:',
          error
        );


        this.isLoading = false;


        // -------------------------------
        // Demo chat limit reached
        // -------------------------------

        if (
          error.status === 403 &&
          error.error?.code ===
            'CHAT_LIMIT_REACHED'
        ) {

          this.messages.push({

            role: 'assistant',

            content:
              'You have reached the 3-message Demo limit for this conversation. Please upgrade to Pro for unlimited chats.'

          });


          this.cdr.markForCheck();

          return;

        }


        // -------------------------------
        // Other errors
        // -------------------------------

        this.messages.push({

          role: 'assistant',

          content:
            'Sorry, something went wrong while processing your request.'

        });


        this.cdr.markForCheck();

      }

    });

}

  openConversation(conversation: Conversation): void {
    this.isLoading = false;
    this.conversationId = conversation.id;

    this.chatService
      .getConversation(conversation.id)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (data: any) => {
          this.messages = data.messages;
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: (error: any) => {
          console.error(error);
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      });
  }

  newChat(): void {
    this.isLoading = false;
    this.conversationId = undefined;  
    this.messages = [];
    this.message = '';
    this.selectedFile = null;
    this.cdr.markForCheck();
  }
}