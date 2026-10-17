
import { Injectable } from '@angular/core';

import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

import { Observable } from 'rxjs';

import {
  environment
} from '../environments/environment';


export interface VoiceTranscriptionResponse {

  transcript: string;

  language: string | null;

}


export interface VoiceSpeechResponse {

  audioChunks: string[];

  mimeType: string;

  truncated: boolean;

}


@Injectable({
  providedIn: 'root'
})
export class VoiceService {

  private readonly apiUrl =
    `${environment.apiUrl}/voice`;


  constructor(
    private http: HttpClient
  ) {}


  // ===================================================
  // TRANSCRIBE RECORDED AUDIO
  // ===================================================

  transcribeAudio(
    audioBlob: Blob,
    filename: string
  ): Observable<VoiceTranscriptionResponse> {

    const formData =
      new FormData();

    formData.append(
      'audio',
      audioBlob,
      filename
    );


    const token =
      localStorage.getItem('accessToken');


    const headers =
      new HttpHeaders({

        Authorization:
          `Bearer ${token}`

      }); 


    return this.http.post<VoiceTranscriptionResponse>(

      `${this.apiUrl}/transcribe`,

      formData,

      { headers }

    );

  }


  // ===================================================
  // GENERATE SPOKEN AI RESPONSE
  // ===================================================

  generateSpeech(
    text: string
  ): Observable<VoiceSpeechResponse> {

    const token =
      localStorage.getItem('accessToken');


    const headers =
      new HttpHeaders({

        Authorization:
          `Bearer ${token}`

      });


    return this.http.post<VoiceSpeechResponse>(

      `${this.apiUrl}/speech`,

      { text },

      { headers }

    );

  }

}
