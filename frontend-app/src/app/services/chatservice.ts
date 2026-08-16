import { Injectable } from '@angular/core';

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
    'http://localhost:3000/api/chat';


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

}
