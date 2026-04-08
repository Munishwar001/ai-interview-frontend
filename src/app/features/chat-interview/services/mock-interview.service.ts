import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environment/environment';
import { UserSkillDto } from '../../profiles/profiles.models';

export interface InterviewSessionDto {
  id: string;
  userId: string;
  skills: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
  messages: InterviewMessageDto[];
}

export interface InterviewMessageDto {
  id?: string | number;
  role: string;
  content: string;
  createdAt: string;
}

export interface StartInterviewResponse {
  sessionId: string;
  skills: string[];
  firstQuestion: string;
}

export interface SendMessageResponse {
  aiMessage: string;
  isCompleted: boolean;
  feedbackSummary?: string | null;
}

@Injectable({ providedIn: 'root' })
export class MockInterviewService {
  private readonly baseUrl = `${environment.apiUrl}/mock-interview`;

  constructor(private http: HttpClient) {}

  getUserSkills(): Observable<UserSkillDto[]> {
    return this.http.get<UserSkillDto[]>(`${environment.apiUrl}/JobSeeker/skills`);
  }

  startInterview(skills: string[]): Observable<StartInterviewResponse> {
    return this.http.post<StartInterviewResponse>(`${this.baseUrl}/start`, { skills });
  }

  getSession(sessionId: string): Observable<InterviewSessionDto> {
    return this.http.get<InterviewSessionDto>(`${this.baseUrl}/session/${sessionId}`);
  }

  getSessions(): Observable<InterviewSessionDto[]> {
    return this.http.get<InterviewSessionDto[]>(`${this.baseUrl}/sessions`);
  }

  sendMessage(sessionId: string, userMessage: string): Observable<SendMessageResponse> {
    return this.http.post<SendMessageResponse>(`${this.baseUrl}/message`, { sessionId, userMessage });
  }
}
