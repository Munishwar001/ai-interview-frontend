import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environment/environment';

export interface CreateJobPayload {
  title: string;
  description: string;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  companyName?: string;
  jobType?: string;
  requiredSkills?: string[];
}

@Injectable({
  providedIn: 'root',
})
export class JobService {
  private baseUrl = environment.apiUrl + '/jobs';

  constructor(private http: HttpClient) {}

  createJob(payload: CreateJobPayload): Observable<any> {
    return this.http.post(this.baseUrl, payload);
  }

 generateDescription(payload: { title: string; skills: string[] }): Observable<any> {
  return this.http.post(`${this.baseUrl}/generate-description`, payload);
}
}
