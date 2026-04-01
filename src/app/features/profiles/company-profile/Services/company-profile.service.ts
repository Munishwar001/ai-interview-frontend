import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../../../environment/environment';
@Injectable({
  providedIn: 'root'
})
export class CompanyProfileService {

  private readonly baseUrl = `${environment.apiUrl}/CompanyProfile`;

  constructor(private http: HttpClient) {}

  getProfile(): Observable<any> {
    return this.http.get<any>(this.baseUrl + '/me').pipe(
      catchError((error) => {
        if (error.status === 404) {
          // Handle 404 error gracefully
          console.warn('Profile not found, returning default profile.');
          return of(null); // Return a default value or null
        }
        throw error; // Re-throw other errors
      })
    );
  }

  saveProfile(payload: any): Observable<any> {
    return this.http.put<any>(this.baseUrl, payload);
  }

  uploadLogo(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('logo', file);
    return this.http.post<any>(`${this.baseUrl}/logo`, formData);
  }

  uploadCover(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('cover', file);
    return this.http.post<any>(`${this.baseUrl}/cover`, formData);
  }
}