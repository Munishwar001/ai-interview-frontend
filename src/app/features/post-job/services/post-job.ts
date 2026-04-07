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

export interface MyJobDto {
  id: number;
  title: string;
  description?: string;
  location?: string;
  companyName?: string;
  companyLogo?: string;
  companyDescription?: string;
  jobType?: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  status?: string;
  isClosed?: boolean;
  createdAt?: string;
  requiredSkills?: string[];
  skills?: Array<string | { name?: string }>;
  applicantsCount?: number;
  viewsCount?: number;
  shortlistedCount?: number;
  applicants?: number;
  views?: number;
  shortlisted?: number;
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

  getMyJobs(): Observable<MyJobDto[] | { data?: MyJobDto[]; items?: MyJobDto[]; result?: MyJobDto[] }> {
    return this.http.get<MyJobDto[] | { data?: MyJobDto[]; items?: MyJobDto[]; result?: MyJobDto[] }>(`${this.baseUrl}/my-jobs`);
  }

  closeJob(id: number): Observable<{ success: boolean }> {
    return this.http.patch<{ success: boolean }>(`${this.baseUrl}/${id}/close`, {});
  }

  reopenJob(id: number): Observable<{ success: boolean }> {
    return this.http.patch<{ success: boolean }>(`${this.baseUrl}/${id}/reopen`, {});
  }

  deleteJob(id: number): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.baseUrl}/${id}`);
  }

 generateDescription(payload: { title: string; skills: string[] }): Observable<any> {
  return this.http.post(`${this.baseUrl}/generate-description`, payload);
}
}
