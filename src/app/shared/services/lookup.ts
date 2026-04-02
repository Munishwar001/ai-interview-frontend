import { Injectable } from '@angular/core';
import { environment } from '../../../../environment/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface lookup {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class Lookup {
   private baseUrl = `${environment.apiUrl}/lookup`;

  constructor(private http: HttpClient) {}

  getJobTypes(): Observable<lookup[]> {
    return this.http.get<lookup[]>(`${this.baseUrl}/job-types`);
  }

  getSkills() {
  return this.http.get<lookup[]>(`${this.baseUrl}/skills`);
  }

  getCompanySizes(): Observable<lookup[]> {
    return this.http.get<lookup[]>(`${this.baseUrl}/company-sizes`);
  }

  getIndustries(): Observable<lookup[]> {
    return this.http.get<lookup[]>(`${this.baseUrl}/industries`);
  }
}
