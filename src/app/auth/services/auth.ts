import { Injectable } from '@angular/core';
import { exhaustMap, Observable ,switchMap,tap ,of, catchError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { RegisterRequest, LoginRequest ,AuthResponse ,RefreshRequest } from '../auth.models';
import { environment } from '../../../../environment/environment';
import { User } from '../../core/services/user';
import { UserStore } from '../../core/services/user-store';
import { AuthStore } from './auth-store';
import { Router } from '@angular/router';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = environment.apiUrl + '/account';

  constructor(
    private http: HttpClient,
    private userService: User,
    private userStore: UserStore ,
    private authStore: AuthStore,
    private router: Router
  ) {}

  register(data: RegisterRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, data);
  }

  login(data: LoginRequest): Observable<any> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/login`, data)
      .pipe(
        tap((resp) => {
           this.authStore.setAccessAndRefreshToken(
            resp.accessToken,
            resp.accessTokenExpiration,
            resp.refreshToken,
          );
        }),
        exhaustMap(() => this.userService.getUserDetails()),
        tap((res) => {
          this.userStore.setUserState(res);
        }),
        switchMap(() => of(void 0))
      );
  }

  refreshToken(refreshRequest: RefreshRequest) {
    return this.http
      .post<AuthResponse>(
        `${environment.apiUrl}/account/refresh-token`,
        refreshRequest,
      )
      .pipe(
        tap((resp) => {
          this.authStore.setAccessAndRefreshToken(
            resp.accessToken,
            resp.accessTokenExpiration,
            resp.refreshToken,
          );
        }),
      );
  }

  isAuthenticated(): Observable<boolean> {
    console.log('Checking authentication status...');
    if (this.isAccessTokenValid()) {
      console.log('Not expired');
      return of(true);
    } else {
      console.log('Expired');

      let refreshReq = this.getRefreshRequest();

      if (refreshReq.accessToken && refreshReq.refreshToken) {
        console.log('Refresh');
        return this.refreshToken(this.getRefreshRequest()).pipe(
          switchMap(() => {
            return of(true);
          }),
          catchError(() => {
            return of(false);
          }),
        );
      } else {
        return of(false);
      }
    }
  }

    isAccessTokenValid() {
    let token = this.authStore.getAccessToken();
    console.log('access toke expire => ' + token?.accessTokenExpiration);

    const currentDatetime = new Date();
    console.log('current datetime => ' + currentDatetime);
    if (token && new Date(token.accessTokenExpiration) > currentDatetime) {
      return true;
    } else {
      return false;
    }
  }

  getRefreshRequest(): RefreshRequest {
    let refreshReq: RefreshRequest = { accessToken: '', refreshToken: '' };

    let currentAccessToken = this.authStore.getAccessToken();
    if (currentAccessToken)
      refreshReq.accessToken = currentAccessToken.accessToken;

    let currentRefreshToken = this.authStore.getRefreshToken();
    if (currentRefreshToken) refreshReq.refreshToken = currentRefreshToken;

    return refreshReq;
  }

    logout() {
    console.log('logging out...');
    this.authStore.clearStorage();
    this.userStore.removeUserState();
    this.router.navigate(['/login']);
  }

}
