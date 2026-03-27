import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

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
export class PostJob {
  private baseUrl = 'https://api.example.com/jobs'; 

  constructor(private http: HttpClient) {}

    createJob(payload: CreateJobPayload): Observable<any> {
    return this.http.post(this.baseUrl, payload);
  }
}
