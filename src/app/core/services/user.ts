import { Injectable } from '@angular/core';
import { environment } from '../../../../environment/environment';
import { HttpClient } from '@angular/common/http';
import { UserResponse } from '../core.model';
@Injectable({
  providedIn: 'root',
})
export class User {
  constructor(private http: HttpClient) {}

  getUserDetails() {
    return this.http.get<UserResponse>(`${environment.apiUrl}/profile` ,{
      withCredentials: true,
    });
  }
}
