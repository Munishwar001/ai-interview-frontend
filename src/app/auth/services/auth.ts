import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { RegisterRequest, LoginRequest } from '../auth.models';
import { environment } from '../../../../environment/environment';
@Injectable({
  providedIn: 'root',
})
export class Auth {
  private baseUrl = environment.apiUrl + '/auth';

  constructor(private http: HttpClient) {}

  register(data: RegisterRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, data);
  }

  login(data: LoginRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, data);
  }
}
