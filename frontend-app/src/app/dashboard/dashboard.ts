import {
  Component,
  ChangeDetectorRef,
  OnInit,
  OnDestroy
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
  GroupChatService
} from '../services/group-chat.service';

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


// =====================================================
// CHAT MESSAGE
// =====================================================

interface ChatMessage {

  _id?: string;

  id?: string;

  role:
    'user' |
    'assistant';

  content: string;

  senderId?: string;

  senderName?: string;

  attachment?: any;

  feedback?:
    'up' |
    'down' |
    null;

}


// =====================================================
// CONVERSATION
// =====================================================

interface Conversation {

  id: string;

  title: string;

  updatedAt: string;

  messageCount: number;

  isGroup?: boolean;

}


// =====================================================
// USER
// =====================================================

interface User {

  id: string;

  firstName: string;

  lastName: string;

  email: string;

  plan:
    'demo' |
    'pro';

  role:
    'user' |
    'admin';

}


// =====================================================
// GROUP MEMBER
// =====================================================

interface GroupMember {

  userId:
    string |
    {
      _id: string;
      firstName?: string;
      lastName?: string;
      email?: string;
    };

  role:
    'owner' |
    'member';

  joinedAt?: string;

}


// =====================================================
// GROUP INFO
// =====================================================

interface GroupInfo {

  _id: string;

  title: string;

  isGroup: boolean;

  userId: string;

  participants: GroupMember[];

}


// =====================================================
// DASHBOARD
// =====================================================

@Component({

  selector:
    'app-dashboard',

  standalone:
    true,

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
  implements OnInit, OnDestroy {


  // ===================================================
  // MESSAGE INPUT
  // ===================================================

  message = '';


  // ===================================================
  // SELECTED FILE
  // ===================================================

  selectedFile:
    File |
    null = null;


  // ===================================================
  // LOADING
  // ===================================================

  isLoading =
    false;


  // ===================================================
  // EMAIL PDF
  // ===================================================

  isEmailingPdf =
    false;


  // ===================================================
  // REGENERATE
  // ===================================================

  regeneratingMessageIndex:
    number |
    null = null;


  // ===================================================
  // FEEDBACK
  // ===================================================

  feedbackLoading:
    number |
    null = null;


  // ===================================================
  // CURRENT CONVERSATION
  // ===================================================

  conversationId:
    string |
    undefined;


    isGroupChat =
  false;


  // ===================================================
// GROUP MODAL
// ===================================================

showCreateGroupModal =
  false;

showGroupInfoModal =
  false;


// ===================================================
// GROUP FORM
// ===================================================

newGroupTitle =
  '';

isCreatingGroup =
  false;


// ===================================================
// CURRENT GROUP
// ===================================================

currentGroup:
  GroupInfo |
  null = null;

groupMembers:
  GroupMember[] = [];


// ===================================================
// INVITE
// ===================================================

inviteLink =
  '';

isCreatingInvite =
  false;

inviteCopied =
  false;


// ===================================================
// MEMBER LOADING
// ===================================================

isLoadingMembers =
  false;


  // ===================================================
  // CONVERSATIONS
  // ===================================================

  conversations:
    Conversation[] = [];


  // ===================================================
  // SEARCH
  // ===================================================

  conversationSearch =
    '';


  // ===================================================
  // MESSAGES
  // ===================================================

  messages:
    ChatMessage[] = [];


  // ===================================================
  // USER
  // ===================================================

  user:
    User |
    null = null;


  // ===================================================
  // PROFILE MENU
  // ===================================================

  showUserMenu =
    false;


  // ===================================================
  // TEMPORARY TEST GROUP
  // ===================================================

  // ===================================================
  // CONSTRUCTOR
  // ===================================================

  constructor(

    private chatService:
      Chatservice,

    private cdr:
      ChangeDetectorRef,

    private authService:
      Auth,

    private router:
      Router,

    private groupChatService:
      GroupChatService

  ) {}


  // ===================================================
  // INIT
  // ===================================================

  ngOnInit(): void {

    this.loadUser();

    this.loadConversations();


    // =================================================
    // GROUP EVENTS
    // =================================================

this.groupChatService.onGroupJoined(
  (data) => {

    console.log(
      '✅ Successfully joined group:',
      data.conversationId
    );

  }
);


    // =================================================
    // GROUP MESSAGE
    // =================================================

this.groupChatService.onGroupMessage(
  (data) => {

    console.log(
      '👤 GROUP MESSAGE RECEIVED:',
      data.message
    );


    // Ignore messages from another group
    if (
      this.conversationId !==
      data.conversationId
    ) {

      return;

    }


    this.messages.push({

      _id:
        data.message._id,

      role:
        data.message.role,

      content:
        data.message.content,

      senderId:
        data.message.senderId,

      senderName:
        data.message.senderName,

      attachment:
        data.message.attachment,

      feedback:
        null

    });


    this.cdr.markForCheck();

  }
);


    // =================================================
    // GROUP AI RESPONSE
    // =================================================

this.groupChatService.onGroupAiResponse(
  (data) => {

    console.log(
      '🤖 GROUP AI RESPONSE RECEIVED:',
      data.message
    );


    // Ignore another group
    if (
      this.conversationId !==
      data.conversationId
    ) {

      return;

    }


    this.messages.push({

      _id:
        data.message._id,

      role:
        'assistant',

      content:
        data.message.content,

      feedback:
        null

    });


    this.isLoading =
      false;


    this.cdr.markForCheck();


    // Refresh sidebar counts
    this.loadConversations();

  }
);


    // =================================================
    // GROUP ERROR
    // =================================================

    this.groupChatService.onGroupError(
      (data) => {

        console.error(
          '❌ GROUP SOCKET ERROR:',
          data.message
        );


        this.cdr.markForCheck();

      }
    );


    // =================================================
    // WAIT FOR SOCKET CONNECTION
    // =================================================

    this.groupChatService.onConnect(
      () => {

        console.log(
          '✅ Angular socket connected'
        );


        // ---------------------------------------------
        // TEMPORARY GROUP TEST
        // ---------------------------------------------


      }
    );


    // =================================================
    // CONNECT SOCKET
    // =================================================

    this.groupChatService.connect();

  }


  // ===================================================
  // DESTROY
  // ===================================================

  ngOnDestroy(): void {

    this.groupChatService.disconnect();

  }


  // ===================================================
  // LOAD USER
  // ===================================================

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


  // ===================================================
  // FULL NAME
  // ===================================================

  get fullName(): string {

    if (!this.user) {

      return 'User';

    }


    return (

      `${this.user.firstName || ''} ` +

      `${this.user.lastName || ''}`

    ).trim();

  }


  // ===================================================
  // INITIALS
  // ===================================================

  get userInitials(): string {

    if (!this.user) {

      return 'U';

    }


    const first =
      this.user.firstName
        ?.charAt(0)
        .toUpperCase() ||
      '';


    const last =
      this.user.lastName
        ?.charAt(0)
        .toUpperCase() ||
      '';


    return (
      first + last
    ) || 'U';

  }


  // ===================================================
  // PRO
  // ===================================================

  get isPro(): boolean {

    return (
      this.user?.plan ===
      'pro'
    );

  }


  // ===================================================
  // ADMIN
  // ===================================================

  get isAdmin(): boolean {

    return (
      this.user?.role ===
      'admin'
    );

  }


  // ===================================================
  // EMAIL CONVERSATION PDF
  // ===================================================

  emailConversationPdf(): void {

    if (!this.conversationId) {

      console.warn(
        'No conversation selected'
      );

      return;

    }


    if (this.isEmailingPdf) {

      return;

    }


    this.isEmailingPdf =
      true;


    this.cdr.markForCheck();


    this.chatService
      .emailConversationPdf(
        this.conversationId
      )
      .pipe(

        finalize(() => {

          this.isEmailingPdf =
            false;

          this.cdr.markForCheck();

        })

      )
      .subscribe({

        next: (
          response
        ) => {

          console.log(
            'Conversation PDF emailed:',
            response
          );

        },


        error: (
          error
        ) => {

          console.error(
            'Email PDF failed:',
            error
          );

        }

      });

  }


  // ===================================================
  // USER MENU
  // ===================================================

  toggleUserMenu(): void {

    this.showUserMenu =
      !this.showUserMenu;

  }


  // ===================================================
  // CLOSE USER MENU
  // ===================================================

  closeUserMenu(): void {

    this.showUserMenu =
      false;

  }


  // ===================================================
  // COPY MESSAGE
  // ===================================================

  copyMessage(
    content: string
  ): void {

    navigator.clipboard
      .writeText(
        content
      )
      .then(() => {

        console.log(
          'Message copied successfully'
        );

      })

      .catch((error) => {

        console.error(
          'Copy failed:',
          error
        );

      });

  }

  // ===================================================
// OPEN CREATE GROUP MODAL
// ===================================================

openCreateGroupModal(): void {

  this.newGroupTitle =
    '';

  this.showCreateGroupModal =
    true;

  this.cdr.markForCheck();

}


// ===================================================
// CLOSE CREATE GROUP MODAL
// ===================================================

closeCreateGroupModal(): void {

  if (this.isCreatingGroup) {

    return;

  }


  this.showCreateGroupModal =
    false;

  this.newGroupTitle =
    '';

  this.cdr.markForCheck();

}


// ===================================================
// CREATE GROUP
// ===================================================

createGroup(): void {

  const title =
    this.newGroupTitle.trim();


  if (!title) {

    return;

  }


  if (this.isCreatingGroup) {

    return;

  }


  this.isCreatingGroup =
    true;


  this.cdr.markForCheck();


  this.groupChatService
    .createGroup(title)
    .pipe(

      finalize(() => {

        this.isCreatingGroup =
          false;

        this.cdr.markForCheck();

      })

    )
    .subscribe({

      next: (
        response
      ) => {

        console.log(
          '✅ Group created:',
          response
        );


        this.showCreateGroupModal =
          false;


        this.newGroupTitle =
          '';


        // Refresh sidebar
        this.loadConversations();


        // ---------------------------------------------
        // Open newly created group
        // ---------------------------------------------

        const newConversation:
          Conversation = {

          id:
            response.conversationId,

          title:
            response.title,

          updatedAt:
            new Date().toISOString(),

          messageCount:
            0,

          isGroup:
            true

        };


        this.openConversation(
          newConversation
        );


        this.cdr.markForCheck();

      },


      error: (
        error
      ) => {

        console.error(
          '❌ Create group failed:',
          error
        );


        this.cdr.markForCheck();

      }

    });

}

// ===================================================
// OPEN GROUP INFO
// ===================================================

openGroupInfo(): void {

  if (
    !this.isGroupChat ||
    !this.conversationId
  ) {

    return;

  }


  this.showGroupInfoModal =
    true;


  this.inviteLink =
    '';

  this.inviteCopied =
    false;


  this.loadGroupMembers();

  this.cdr.markForCheck();

}


// ===================================================
// CLOSE GROUP INFO
// ===================================================

closeGroupInfo(): void {

  if (this.isCreatingInvite) {

    return;

  }


  this.showGroupInfoModal =
    false;

  this.cdr.markForCheck();

}


// ===================================================
// LOAD GROUP MEMBERS
// ===================================================

loadGroupMembers(): void {

  if (!this.conversationId) {

    return;

  }


  this.isLoadingMembers =
    true;


  this.groupChatService
    .getGroupMembers(
      this.conversationId
    )
    .pipe(

      finalize(() => {

        this.isLoadingMembers =
          false;

        this.cdr.markForCheck();

      })

    )
    .subscribe({

      next: (
        response
      ) => {

        this.groupMembers =
          response.members || [];

      },


      error: (
        error
      ) => {

        console.error(
          '❌ Failed to load group members:',
          error
        );


        this.groupMembers =
          [];

      }

    });

}


// ===================================================
// CREATE INVITE LINK
// ===================================================

createInviteLink(): void {

  if (
    !this.conversationId
  ) {

    return;

  }


  if (this.isCreatingInvite) {

    return;

  }


  this.isCreatingInvite =
    true;


  this.inviteCopied =
    false;


  this.groupChatService
    .createInvite(
      this.conversationId
    )
    .pipe(

      finalize(() => {

        this.isCreatingInvite =
          false;

        this.cdr.markForCheck();

      })

    )
    .subscribe({

      next: (
        response
      ) => {

        console.log(
          '✅ Invite created:',
          response
        );


        const baseUrl =
          window.location.origin;


        this.inviteLink =
          `${baseUrl}/join/group/${response.token}`;


        this.cdr.markForCheck();

      },


      error: (
        error
      ) => {

        console.error(
          '❌ Invite creation failed:',
          error
        );

      }

    });

}


// ===================================================
// COPY INVITE LINK
// ===================================================

copyInviteLink(): void {

  if (!this.inviteLink) {

    return;

  }


  navigator.clipboard
    .writeText(
      this.inviteLink
    )
    .then(() => {

      this.inviteCopied =
        true;


      this.cdr.markForCheck();


      setTimeout(() => {

        this.inviteCopied =
          false;

        this.cdr.markForCheck();

      }, 2000);

    })

    .catch((error) => {

      console.error(
        '❌ Failed to copy invite:',
        error
      );

    });

}

// ===================================================
// CHECK GROUP OWNER
// ===================================================

isGroupOwner(
  member: GroupMember
): boolean {

  const memberId =
    typeof member.userId === 'string'
      ? member.userId
      : member.userId._id;


  return (
    member.role === 'owner' &&
    !!this.user &&
    memberId === this.user.id
  );

}


// ===================================================
// REMOVE MEMBER
// ===================================================

removeGroupMember(
  member: GroupMember
): void {

  if (
    !this.conversationId ||
    !this.user
  ) {

    return;

  }


  const memberId =
    typeof member.userId === 'string'
      ? member.userId
      : member.userId._id;


  // -----------------------------------------------
  // Owner cannot remove themselves
  // -----------------------------------------------

  if (
    memberId === this.user.id
  ) {

    return;

  }


  this.groupChatService
    .removeGroupMember(

      this.conversationId,

      memberId

    )
    .subscribe({

      next: () => {

        console.log(
          '✅ Member removed'
        );


        this.loadGroupMembers();

      },


      error: (
        error
      ) => {

        console.error(
          '❌ Remove member failed:',
          error
        );

      }

    });

}

// ===================================================
// CURRENT CONVERSATION TITLE
// ===================================================

getCurrentConversationTitle(): string {

  const conversation =
    this.conversations.find(
      item =>
        item.id ===
        this.conversationId
    );


  return (
    conversation?.title ||
    (
      this.isGroupChat
        ? 'Group Chat'
        : 'Chat'
    )
  );

}


  // ===================================================
  // REGENERATE
  // ===================================================

  regenerateMessage(
    messageIndex: number
  ): void {

    if (
      this.isLoading ||
      this.regeneratingMessageIndex !==
        null
    ) {

      return;

    }


    if (!this.conversationId) {

      console.warn(
        'No conversation selected'
      );

      return;

    }


    const lastMessageIndex =
      this.messages.length - 1;


    if (
      messageIndex !==
      lastMessageIndex
    ) {

      console.warn(
        'Only the latest AI response can be regenerated'
      );

      return;

    }


    const message =
      this.messages[
        messageIndex
      ];


    if (
      message.role !==
      'assistant'
    ) {

      return;

    }


    this.regeneratingMessageIndex =
      messageIndex;


    this.cdr.markForCheck();


    this.chatService
      .regenerateResponse(
        this.conversationId
      )
      .pipe(

        finalize(() => {

          this.regeneratingMessageIndex =
            null;

          this.cdr.markForCheck();

        })

      )
      .subscribe({

        next: (
          response
        ) => {

          console.log(
            'Regenerated response:',
            response
          );


          this.messages[
            messageIndex
          ] = {

            _id:
              response.messageId,

            role:
              'assistant',

            content:
              response.content,

            feedback:
              null

          };


          this.cdr.markForCheck();

        },


        error: (
          error
        ) => {

          console.error(
            'Regenerate failed:',
            error
          );


          this.cdr.markForCheck();

        }

      });

  }


  // ===================================================
  // FEEDBACK
  // ===================================================

  giveFeedback(
    messageIndex: number,
    feedback:
      'up' |
      'down'
  ): void {

    const message =
      this.messages[
        messageIndex
      ];


    if (
      !message ||
      message.role !==
        'assistant'
    ) {

      return;

    }


    if (!this.conversationId) {

      return;

    }


    const messageId =
      message._id ||
      message.id;


    if (!messageId) {

      console.warn(
        'Message ID missing'
      );

      return;

    }


    this.feedbackLoading =
      messageIndex;


    this.chatService
      .sendFeedback(
        this.conversationId,
        messageId,
        feedback
      )
      .pipe(

        finalize(() => {

          this.feedbackLoading =
            null;

          this.cdr.markForCheck();

        })

      )
      .subscribe({

        next: (
          response
        ) => {

          console.log(
            'Feedback saved:',
            response
          );


          this.messages[
            messageIndex
          ].feedback =
            feedback;


          this.cdr.markForCheck();

        },


        error: (
          error
        ) => {

          console.error(
            'Feedback failed:',
            error
          );

        }

      });

  }


  // ===================================================
  // UPGRADE
  // ===================================================

  upgradeToPro(): void {

    this.closeUserMenu();


    this.router.navigate([
      '/pricing'
    ]);

  }


  // ===================================================
  // ADMIN PANEL
  // ===================================================

  openAdminPanel(): void {

    this.closeUserMenu();


    this.router.navigate([
      '/admin'
    ]);

  }


  // ===================================================
  // LOAD CONVERSATIONS
  // ===================================================

  loadConversations(): void {

    this.chatService
      .getConversations()
      .subscribe({

        next: (
          data: any
        ) => {

          this.conversations =
            data;


          this.isLoading =
            false;


          this.cdr.markForCheck();

        },


        error: (
          error: any
        ) => {

          console.error(
            error
          );


          this.cdr.markForCheck();

        }

      });

  }


  // ===================================================
  // FILTER CONVERSATIONS
  // ===================================================

  get filteredConversations():
    Conversation[] {

    const search =
      this.conversationSearch
        .trim()
        .toLowerCase();


    if (!search) {

      return this.conversations;

    }


    return this.conversations.filter(
      conversation =>
        conversation.title
          ?.toLowerCase()
          .includes(search)
    );

  }


  // ===================================================
  // SELECT FILE
  // ===================================================

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


  // ===================================================
  // REMOVE FILE
  // ===================================================

  removeFile(): void {

    this.selectedFile =
      null;

  }


  // ===================================================
  // SEND NORMAL MESSAGE
  // ===================================================

// ===================================================
// SEND MESSAGE
// ===================================================

sendMessage(): void {

  const message =
    this.message.trim();


  const file =
    this.selectedFile;


  // -----------------------------------------------
  // Nothing to send
  // -----------------------------------------------

  if (
    !message &&
    !file
  ) {

    return;

  }


  // =================================================
  // GROUP CHAT
  // =================================================

  if (
    this.isGroupChat
  ) {

    // ---------------------------------------------
    // Group chat currently supports text messages
    // ---------------------------------------------

    if (file) {

      console.warn(
        'File attachments for group chat will be added next.'
      );

      return;

    }


    if (
      !this.conversationId
    ) {

      console.warn(
        'No group conversation selected'
      );

      return;

    }


    // ---------------------------------------------
    // Clear input
    // ---------------------------------------------

    this.message =
      '';


    // ---------------------------------------------
    // Show loading state
    // ---------------------------------------------

    this.isLoading =
      true;


    this.cdr.markForCheck();


    // ---------------------------------------------
    // Send through Socket.IO
    // ---------------------------------------------

    this.groupChatService.sendGroupMessage(

      this.conversationId,

      message

    );


    return;

  }


  // =================================================
  // PERSONAL CHAT
  // =================================================

  this.message =
    '';


  this.selectedFile =
    null;


  // -----------------------------------------------
  // Optimistic user message
  // -----------------------------------------------

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

      next: (
        response
      ) => {

        console.log(
          'Chat response:',
          response
        );


        this.conversationId =
          response.conversationId;


        this.messages.push({

          _id:

            response
              ?.assistantMessage
              ?._id ||

            response
              ?.assistantMessage
              ?.id,

          role:
            'assistant',

          content:
            response
              ?.assistantMessage
              ?.content,

          feedback:
            null

        });


        this.isLoading =
          false;


        this.cdr.markForCheck();


        this.loadConversations();

      },


      error: (
        error
      ) => {

        console.error(
          'Chat API error:',
          error
        );


        this.isLoading =
          false;


        if (

          error.status ===
            403 &&

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


  // ===================================================
  // OPEN CONVERSATION
  // ===================================================

// ===================================================
// OPEN CONVERSATION
// ===================================================

openConversation(
  conversation: Conversation
): void {

  // -----------------------------------------------
  // Leave previous group if necessary
  // -----------------------------------------------

  if (
    this.isGroupChat &&
    this.conversationId
  ) {

    this.groupChatService.leaveGroup(
      this.conversationId
    );

  }


  // -----------------------------------------------
  // Set current conversation
  // -----------------------------------------------

  this.conversationId =
    conversation.id;


  // -----------------------------------------------
  // Set chat type
  // -----------------------------------------------

  this.isGroupChat =
    conversation.isGroup === true;


  this.isLoading =
    true;


  this.messages =
    [];


  this.cdr.markForCheck();


  // =================================================
  // GROUP CHAT
  // =================================================

  if (this.isGroupChat) {

    this.groupChatService
      .getGroupConversation(
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

        next: (
          data: any
        ) => {

          console.log(
            '👥 Group conversation:',
            data
          );


          // -----------------------------------------
          // Load existing messages
          // -----------------------------------------

          this.messages =
            (data.messages || [])
              .map(
                (message: any) => ({

                  ...message,

                  _id:
                    message._id ||
                    message.id,

                  feedback:
                    message.feedback ||
                    null

                })
              );


          // -----------------------------------------
          // Join Socket.IO room
          // -----------------------------------------

          this.groupChatService.onConnect(
            () => {

              this.groupChatService.joinGroup(
                conversation.id
              );

            }
          );


          // -----------------------------------------
          // Socket may already be connected
          // -----------------------------------------

          if (
            this.groupChatService.isConnected()
          ) {

            this.groupChatService.joinGroup(
              conversation.id
            );

          }


          this.cdr.markForCheck();

        },


        error: (
          error: any
        ) => {

          console.error(
            '❌ Failed to load group:',
            error
          );


          this.messages = [];


          this.cdr.markForCheck();

        }

      });


    return;

  }


  // =================================================
  // PERSONAL CHAT
  // =================================================

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

      next: (
        data: any
      ) => {

        this.messages =
          (data.messages || [])
            .map(
              (message: any) => ({

                ...message,

                _id:
                  message._id ||
                  message.id,

                feedback:
                  message.feedback ||
                  null

              })
            );


        this.cdr.markForCheck();

      },


      error: (
        error: any
      ) => {

        console.error(
          '❌ Failed to load conversation:',
          error
        );


        this.messages = [];


        this.cdr.markForCheck();

      }

    });

}


  // ===================================================
  // EXPORT CONVERSATION PDF
  // ===================================================

  exportConversationPdf(): void {

    if (!this.conversationId) {

      console.warn(
        'No conversation selected'
      );

      return;

    }


    this.chatService
      .exportConversationPdf(
        this.conversationId
      )
      .subscribe({

        next: (
          blob: Blob
        ) => {

          const url =
            window.URL.createObjectURL(
              blob
            );


          const anchor =
            document.createElement(
              'a'
            );


          anchor.href =
            url;


          anchor.download =
            'ai-conversation.pdf';


          anchor.click();


          window.URL.revokeObjectURL(
            url
          );

        },


        error: (
          error
        ) => {

          console.error(
            'PDF export failed:',
            error
          );

        }

      });

  }


  // ===================================================
  // NEW CHAT
  // ===================================================

// ===================================================
// NEW CHAT
// ===================================================

newChat(): void {

  // -----------------------------------------------
  // Leave group room
  // -----------------------------------------------

  if (
    this.isGroupChat &&
    this.conversationId
  ) {

    this.groupChatService.leaveGroup(
      this.conversationId
    );

  }


  this.isLoading =
    false;


  this.conversationId =
    undefined;


  this.isGroupChat =
    false;


  this.messages =
    [];


  this.message =
    '';


  this.selectedFile =
    null;


  this.cdr.markForCheck();

}

  // ===================================================
  // LOGOUT
  // ===================================================

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


        error: (
          error
        ) => {

          console.error(
            'Logout API error:',
            error
          );


          this.clearLocalAuth();

        }

      });

  }


  // ===================================================
  // CLEAR AUTH
  // ===================================================

  private clearLocalAuth(): void {

    // -----------------------------------------------
    // Disconnect socket first
    // -----------------------------------------------

    this.groupChatService.disconnect();


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