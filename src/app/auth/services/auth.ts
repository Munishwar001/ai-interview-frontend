import { Injectable } from '@angular/core';
import { exhaustMap, Observable, switchMap, tap, of, catchError, finalize } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  AuthResponse,
  RefreshRequest,
} from '../auth.models';
import { environment } from '../../../../environment/environment';
import { User } from '../../core/services/user';
import { UserStore } from '../../core/services/user-store';
import { AuthStore } from './auth-store';
import { Router } from '@angular/router';
import { SocialAuthService } from '@abacritt/angularx-social-login';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = environment.apiUrl + '/account';

  constructor(
    private http: HttpClient,
    private userService: User,
    private userStore: UserStore,
    private authStore: AuthStore,
    private router: Router,
    private socialAuthService: SocialAuthService,
  ) {}

  register(data: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.baseUrl}/register`, data);
  }

  login(data: LoginRequest): Observable<any> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, data).pipe(
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
      switchMap(() => of(void 0)),
    );
  }

  refreshToken(refreshRequest: RefreshRequest) {
    return this.http.post<AuthResponse>(`${this.baseUrl}/refresh-token`, refreshRequest).pipe(
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
// console.log removed
    if (this.isAccessTokenValid()) {
// console.log removed
      return of(true);
    } else {
// console.log removed

      let refreshReq = this.getRefreshRequest();

      if (refreshReq.accessToken && refreshReq.refreshToken) {
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
// console.log removed

    const currentDatetime = new Date();
// console.log removed
    if (token && new Date(token.accessTokenExpiration) > currentDatetime) {
      return true;
    } else {
      return false;
    }
  }

  getRefreshRequest(): RefreshRequest {
    let refreshReq: RefreshRequest = { accessToken: '', refreshToken: '' };

    let currentAccessToken = this.authStore.getAccessToken();
    if (currentAccessToken) refreshReq.accessToken = currentAccessToken.accessToken;

    let currentRefreshToken = this.authStore.getRefreshToken();
    if (currentRefreshToken) refreshReq.refreshToken = currentRefreshToken;

    return refreshReq;
  }

  revokeRefreshToken() {
// console.log removed
    let currentRefreshToken = this.authStore.getRefreshToken();
    return this.http.post<boolean>(`${this.baseUrl}/revoke-token`, {
      refreshToken: currentRefreshToken,
    });
  }

  logout() {
  this.socialAuthService.signOut().catch(() => {
// console.log removed
  });
  
  this.revokeRefreshToken().pipe(
    finalize(() => {
      this.authStore.clearStorage();
      this.userStore.removeUserState();
      this.router.navigate(['/login']);
    })
  ).subscribe();
}

  googleLogin(payload: { idToken: string|undefined; role: string }): Observable<any> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/google-login`, payload).pipe(
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
      switchMap(() => of(void 0)),
    );
  }
}
