import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../../../environment/environment';

@Injectable({ providedIn: 'root' })
export class CompanyProfileService {
  private readonly baseUrl = `${environment.apiUrl}/CompanyProfile`;

  constructor(private http: HttpClient) {}

  getProfile(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/me`).pipe(
      catchError((error) => {
        if (error.status === 404) return of(null);
        throw error;
      })
    );
  }

  /** PUT /CompanyProfile — application/json */
  saveProfile(payload: any): Observable<any> {
    return this.http.put<any>(this.baseUrl, payload);
  }

  /** POST /CompanyProfile/upload-images — multipart/form-data */
  uploadImages(logoFile?: File | null, coverFile?: File | null): Observable<any> {
    const fd = new FormData();
    if (logoFile)  fd.append('logo',        logoFile,  logoFile.name);
    if (coverFile) fd.append('coverImage',  coverFile, coverFile.name);
    return this.http.post<any>(`${this.baseUrl}/upload-images`, fd);
  }

  /** POST /CompanyProfile/generate-description */
  generateDescription(companyName: string, industry: string, tagline: string): Observable<{ description: string }> {
    return this.http.post<{ description: string }>(`${this.baseUrl}/generate-description`, {
      companyName,
      industry,
      tagline,
    });
  }
}
