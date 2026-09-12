import {
  Injectable
} from '@angular/core';

import {
  io,
  Socket
} from 'socket.io-client';

import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

import {
  environment
} from '../environments/environment';


// =====================================================
// GROUP MESSAGE
// =====================================================

export interface GroupMessage {

  _id?: string;

  role:
    'user' |
    'assistant';

  content: string;

  senderId?: string;

  senderName?: string;

  createdAt?: string;

  updatedAt?: string;

  attachment?: {

    type?: string;

    fileName?: string;

    mimeType?: string;

    fileUrl?: string;

  };

}


// =====================================================
// GROUP MESSAGE EVENT
// =====================================================

export interface GroupMessageEvent {

  message: GroupMessage;

  conversationId: string;

}


// =====================================================
// GROUP JOINED EVENT
// =====================================================

export interface GroupJoinedEvent {

  conversationId: string;

}


// =====================================================
// GROUP ERROR EVENT
// =====================================================

export interface GroupErrorEvent {

  message: string;

  code?: string;

}


// =====================================================
// GROUP CHAT SERVICE
// =====================================================

@Injectable({
  providedIn: 'root'
})
export class GroupChatService {

  constructor(
  private http: HttpClient
) {}


  // ===================================================
  // SOCKET
  // ===================================================

  private socket: Socket | null = null;


  // ===================================================
  // PENDING CONNECT CALLBACKS
  // ===================================================

  private connectCallbacks:
    Array<() => void> = [];


  // ===================================================
  // PENDING GROUP JOIN CALLBACKS
  // ===================================================

  private groupJoinedCallbacks:
    Array<
      (data: GroupJoinedEvent) => void
    > = [];


  // ===================================================
  // PENDING GROUP MESSAGE CALLBACKS
  // ===================================================

  private groupMessageCallbacks:
    Array<
      (data: GroupMessageEvent) => void
    > = [];


  // ===================================================
  // PENDING GROUP AI RESPONSE CALLBACKS
  // ===================================================

  private groupAiResponseCallbacks:
    Array<
      (data: GroupMessageEvent) => void
    > = [];


  // ===================================================
  // PENDING GROUP ERROR CALLBACKS
  // ===================================================

  private groupErrorCallbacks:
    Array<
      (data: GroupErrorEvent) => void
    > = [];


  // ===================================================
  // CONNECT
  // ===================================================

  connect(): void {

    // -----------------------------------------------
    // Already connected
    // -----------------------------------------------

    if (
      this.socket &&
      this.socket.connected
    ) {

      this.runConnectCallbacks();

      return;

    }


    // -----------------------------------------------
    // Connection already being created
    // -----------------------------------------------

    if (this.socket) {

      return;

    }


    // -----------------------------------------------
    // Get access token
    // -----------------------------------------------

    const token =
      localStorage.getItem(
        'accessToken'
      );


    if (!token) {

      console.error(
        '❌ Access token not found'
      );

      return;

    }


    // -----------------------------------------------
    // Backend URL
    // -----------------------------------------------

    const socketUrl =
      environment.apiUrl
        .replace(
          /\/api\/?$/,
          ''
        );


    console.log(
      '🔌 Connecting Socket.IO to:',
      socketUrl
    );


    // -----------------------------------------------
    // Create socket
    // -----------------------------------------------

    this.socket =
      io(
        socketUrl,
        {

          auth: {
            token
          },

          withCredentials:
            true,

          transports: [
            'websocket',
            'polling'
          ]

        }
      );


    // =================================================
    // REGISTER PENDING EVENT LISTENERS
    // =================================================

    this.registerPendingListeners();


    // =================================================
    // CONNECT
    // =================================================

    this.socket.on(
      'connect',
      () => {

        console.log(
          '✅ Socket.IO connected:',
          this.socket?.id
        );


        this.runConnectCallbacks();

      }
    );


    // =================================================
    // CONNECTION ERROR
    // =================================================

    this.socket.on(
      'connect_error',
      (error) => {

        console.error(
          '❌ Socket.IO connection error:',
          error.message
        );

      }
    );


    // =================================================
    // DISCONNECT
    // =================================================

    this.socket.on(
      'disconnect',
      (reason) => {

        console.log(
          '🔌 Socket.IO disconnected:',
          reason
        );

      }
    );

  }


  // ===================================================
  // REGISTER PENDING LISTENERS
  // ===================================================

  private registerPendingListeners(): void {

    if (!this.socket) {

      return;

    }


    // -----------------------------------------------
    // Group joined
    // -----------------------------------------------

    this.groupJoinedCallbacks.forEach(
      callback => {

        this.socket?.on(
          'group-joined',
          callback
        );

      }
    );


    // -----------------------------------------------
    // Group message
    // -----------------------------------------------

    this.groupMessageCallbacks.forEach(
      callback => {

        this.socket?.on(
          'group-message',
          callback
        );

      }
    );


    // -----------------------------------------------
    // Group AI response
    // -----------------------------------------------

    this.groupAiResponseCallbacks.forEach(
      callback => {

        this.socket?.on(
          'group-ai-response',
          callback
        );

      }
    );


    // -----------------------------------------------
    // Group error
    // -----------------------------------------------

    this.groupErrorCallbacks.forEach(
      callback => {

        this.socket?.on(
          'group-error',
          callback
        );

      }
    );

  }


  // ===================================================
  // RUN CONNECT CALLBACKS
  // ===================================================

  private runConnectCallbacks(): void {

    const callbacks =
      [...this.connectCallbacks];


    this.connectCallbacks =
      [];


    callbacks.forEach(
      callback => {

        try {

          callback();

        }

        catch (error) {

          console.error(
            'Connect callback error:',
            error
          );

        }

      }
    );

  }


  // ===================================================
  // ON CONNECT
  // ===================================================

  onConnect(
    callback: () => void
  ): void {

    // -----------------------------------------------
    // Already connected
    // -----------------------------------------------

    if (
      this.socket &&
      this.socket.connected
    ) {

      callback();

      return;

    }


    // -----------------------------------------------
    // Store callback
    // -----------------------------------------------

    this.connectCallbacks.push(
      callback
    );

  }


  // ===================================================
  // JOIN GROUP
  // ===================================================

  joinGroup(
    conversationId: string
  ): void {

    if (!conversationId) {

      console.error(
        '❌ Conversation ID is required'
      );

      return;

    }


    if (!this.socket) {

      console.error(
        '❌ Socket is not initialized'
      );

      return;

    }


    if (!this.socket.connected) {

      console.error(
        '❌ Socket is not connected'
      );

      return;

    }


    console.log(
      '👥 Joining group:',
      conversationId
    );


    this.socket.emit(
      'join-group',
      conversationId
    );

  }


  // ===================================================
  // ON GROUP JOINED
  // ===================================================

  onGroupJoined(
    callback: (
      data: GroupJoinedEvent
    ) => void
  ): void {

    // -----------------------------------------------
    // Socket already exists
    // -----------------------------------------------

    if (this.socket) {

      this.socket.on(
        'group-joined',
        callback
      );

      return;

    }


    // -----------------------------------------------
    // Socket will be created later
    // -----------------------------------------------

    this.groupJoinedCallbacks.push(
      callback
    );

  }


  // ===================================================
  // SEND GROUP MESSAGE
  // ===================================================

  sendGroupMessage(
    conversationId: string,
    message: string
  ): void {

    if (!conversationId) {

      console.error(
        '❌ Conversation ID is required'
      );

      return;

    }


    if (!message?.trim()) {

      console.error(
        '❌ Group message cannot be empty'
      );

      return;

    }


    if (!this.socket) {

      console.error(
        '❌ Socket is not initialized'
      );

      return;

    }


    if (!this.socket.connected) {

      console.error(
        '❌ Socket is not connected'
      );

      return;

    }


    console.log(
      '📤 Sending group message:',
      message
    );


    this.socket.emit(
      'send-group-message',
      {

        conversationId,

        message:
          message.trim()

      },

      (response: any) => {

        console.log(
          '📨 Group message acknowledgement:',
          response
        );


        if (
          !response?.success
        ) {

          console.error(
            '❌ Group message failed:',
            response?.message
          );

        }

      }

    );

  }


  // ===================================================
  // ON GROUP MESSAGE
  // ===================================================

  onGroupMessage(
    callback: (
      data: GroupMessageEvent
    ) => void
  ): void {

    if (this.socket) {

      this.socket.on(
        'group-message',
        callback
      );

      return;

    }


    this.groupMessageCallbacks.push(
      callback
    );

  }


  // ===================================================
  // ON GROUP AI RESPONSE
  // ===================================================

  onGroupAiResponse(
    callback: (
      data: GroupMessageEvent
    ) => void
  ): void {

    if (this.socket) {

      this.socket.on(
        'group-ai-response',
        callback
      );

      return;

    }


    this.groupAiResponseCallbacks.push(
      callback
    );

  }


  // ===================================================
  // ON GROUP ERROR
  // ===================================================

  onGroupError(
    callback: (
      data: GroupErrorEvent
    ) => void
  ): void {

    if (this.socket) {

      this.socket.on(
        'group-error',
        callback
      );

      return;

    }


    this.groupErrorCallbacks.push(
      callback
    );

  }


  // ===================================================
  // LEAVE GROUP
  // ===================================================

  leaveGroup(
    conversationId: string
  ): void {

    if (
      !this.socket ||
      !this.socket.connected
    ) {

      return;

    }


    if (!conversationId) {

      return;

    }


    const roomName =
      conversationId;


    console.log(
      '🚪 Leaving group:',
      roomName
    );


    this.socket.emit(
      'leave-group',
      conversationId
    );

  }


  // ===================================================
  // CHECK CONNECTION
  // ===================================================

  isConnected(): boolean {

    return !!(
      this.socket &&
      this.socket.connected
    );

  }

  // ===================================================
// GET GROUP CONVERSATION
// ===================================================

getGroupConversation(
  conversationId: string
) {

  const token =
    localStorage.getItem(
      'accessToken'
    );


  const headers =
    new HttpHeaders({

      Authorization:
        `Bearer ${token}`

    });


  return this.http.get<any>(

    `${environment.apiUrl}/group-chat/${conversationId}`,

    {
      headers
    }

  );

}


  // ===================================================
  // REMOVE EVENT LISTENER
  // ===================================================

  off(
    eventName: string
  ): void {

    if (!this.socket) {

      return;

    }


    this.socket.off(
      eventName
    );

  }

  // ===================================================
// CREATE GROUP
// ===================================================

createGroup(
  title: string
) {

  const token =
    localStorage.getItem(
      'accessToken'
    );


  const headers =
    new HttpHeaders({

      Authorization:
        `Bearer ${token}`

    });


  return this.http.post<any>(

    `${environment.apiUrl}/group-chat/create`,

    {
      title
    },

    {
      headers
    }

  );

}


// ===================================================
// CREATE INVITE
// ===================================================

createInvite(
  conversationId: string
) {

  const token =
    localStorage.getItem(
      'accessToken'
    );


  const headers =
    new HttpHeaders({

      Authorization:
        `Bearer ${token}`

    });


  return this.http.post<any>(

    `${environment.apiUrl}/group-chat/${conversationId}/invite`,

    {},

    {
      headers
    }

  );

}


// ===================================================
// GET GROUP MEMBERS
// ===================================================

getGroupMembers(
  conversationId: string
) {

  const token =
    localStorage.getItem(
      'accessToken'
    );


  const headers =
    new HttpHeaders({

      Authorization:
        `Bearer ${token}`

    });


  return this.http.get<any>(

    `${environment.apiUrl}/group-chat/${conversationId}/members`,

    {
      headers
    }

  );

}


// ===================================================
// REMOVE GROUP MEMBER
// ===================================================

removeGroupMember(
  conversationId: string,
  memberId: string
) {

  const token =
    localStorage.getItem(
      'accessToken'
    );


  const headers =
    new HttpHeaders({

      Authorization:
        `Bearer ${token}`

    });


  return this.http.delete<any>(

    `${environment.apiUrl}/group-chat/${conversationId}/members/${memberId}`,

    {
      headers
    }

  );

}
// ===================================================
// JOIN GROUP USING INVITE TOKEN
// ===================================================

joinGroupByInviteToken(
  token: string
) {

  const accessToken =
    localStorage.getItem(
      'accessToken'
    );


  const headers =
    new HttpHeaders({

      Authorization:
        `Bearer ${accessToken}`

    });


  return this.http.post<any>(

    `${environment.apiUrl}/group-chat/join/${encodeURIComponent(token)}`,

    {},

    {
      headers
    }

  );

}


  // ===================================================
  // DISCONNECT
  // ===================================================

  disconnect(): void {

    if (!this.socket) {

      return;

    }


    console.log(
      '🔌 Disconnecting Socket.IO'
    );


    this.socket.disconnect();

    this.socket = null;

  }

}