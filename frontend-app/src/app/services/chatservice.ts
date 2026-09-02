import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';

import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

import {
  Observable
} from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class Chatservice {
  private apiUrl =
    `${environment.apiUrl}/chat`;


  constructor(
    private http: HttpClient
  ) {}


  sendMessage(
    message: string,
    conversationId?: string,
    file?: File
  ): Observable<any> {

    const formData =
      new FormData();


    formData.append(
      'message',
      message
    );


    if (conversationId) {

      formData.append(
        'conversationId',
        conversationId
      );

    }


    if (file) {

      formData.append(
        'file',
        file
      );

    }


    const token =
      localStorage.getItem(
        'accessToken'
      );


    const headers =
      new HttpHeaders({

        Authorization:
          `Bearer ${token}`

      });


    return this.http.post(

      `${this.apiUrl}/message`,

      formData,

      {
        headers
      }

    );

  }


  getConversations(): Observable<any[]> {

    const token =
      localStorage.getItem(
        'accessToken'
      );


    const headers =
      new HttpHeaders({

        Authorization:
          `Bearer ${token}`

      });


    return this.http.get<any[]>(

      `${this.apiUrl}/conversations`,

      {
        headers
      }

    );

  }


  getConversation(
    id: string
  ): Observable<any> {

    const token =
      localStorage.getItem(
        'accessToken'
      );


    const headers =
      new HttpHeaders({

        Authorization:
          `Bearer ${token}`

      });


    return this.http.get(

      `${this.apiUrl}/conversations/${id}`,

      {
        headers
      }

    );

  }

  regenerateResponse(
  conversationId: string
): Observable<any> {

  const token =
    localStorage.getItem('accessToken');

  const headers =
    new HttpHeaders({
      Authorization:
        `Bearer ${token}`
    });

  return this.http.post(
    `${this.apiUrl}/regenerate`,
    {
      conversationId
    },
    {
      headers
    }
  );
}


sendFeedback(
  conversationId: string,
  messageId: string,
  feedback: 'up' | 'down'
): Observable<any> {

  const token =
    localStorage.getItem('accessToken');

  const headers =
    new HttpHeaders({
      Authorization:
        `Bearer ${token}`
    });

  return this.http.post(
    `${this.apiUrl}/feedback`,
    {
      conversationId,
      messageId,
      feedback
    },
    {
      headers
    }
  );
}

}
