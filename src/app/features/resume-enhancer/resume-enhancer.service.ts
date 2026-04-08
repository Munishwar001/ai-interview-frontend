import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environment/environment';

@Injectable({ providedIn: 'root' })
export class ResumeEnhancerService {
  private readonly baseUrl = `${environment.apiUrl}/resume-enhancer`;

  constructor(private http: HttpClient) {}

  analyze(resume: File): Observable<unknown> {
    const formData = new FormData();
    formData.append('resume', resume, resume.name);
    return this.http.post<unknown>(`${this.baseUrl}/analyze`, formData);
  }

  analyzeFromProfile(): Observable<unknown> {
    return this.http.post<unknown>(`${this.baseUrl}/analyze-from-profile`, {});
  }

  getResult(): Observable<unknown> {
    return this.http.get<unknown>(`${this.baseUrl}/result`);
  }
}
