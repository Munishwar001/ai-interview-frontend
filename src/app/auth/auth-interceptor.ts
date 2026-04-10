import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { AuthStore } from './services/auth-store';
import { AuthService } from './services/auth';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserStore } from '../core/services/user-store';
import { BehaviorSubject, catchError, filter, finalize, switchMap, take, throwError } from 'rxjs';
import { ErrorCategory } from '../core/core.model';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const storeService = inject(UserStore);
  const localStorageService = inject(AuthStore);

  let refreshTokenInProgress = false;
  let refreshTokenSubject = new BehaviorSubject<boolean | null>(null);
  
  req = addAuthenticationToken(req, localStorageService);
  
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {

      if (err && err.status === 401) { // Unauthorized
// console.log removed

        if (err.error && err.error.errorCategory === ErrorCategory.LOGIN_401) {
          // Do nothing for login form
// console.log removed
        }
        else {
          // Token expired
          if (!err.error) {
// console.log removed

            if (refreshTokenInProgress) {

// console.log removed
              // If refreshTokenInProgress is true, we will wait until refreshTokenSubject has a non-null value
              // which means the new token is ready and we can retry the request again
              return refreshTokenSubject.pipe(
                filter(result => result !== null),
                take(1),
                switchMap(() => next(addAuthenticationToken(req, localStorageService)))
              );
            }
            else {
// console.log removed
              refreshTokenInProgress = true;

              // Set the refreshTokenSubject to null so that subsequent API calls will wait until the new token has been retrieved
              refreshTokenSubject.next(null);

              var refreshRequest = authService.getRefreshRequest();
              return authService.refreshToken(refreshRequest).pipe(
                switchMap((authData) => {
// console.log removed
                  refreshTokenSubject.next(true);
                  return next(addAuthenticationToken(req, localStorageService));
                }),
                catchError((error) => {
// console.log removed
                  router.navigate(['/login']);
                  return throwError(() => 'to login...');
                }),
                // When the call to refreshToken completes we reset the refreshTokenInProgress to false
                // for the next time the token needs to be refreshed
                finalize(() => refreshTokenInProgress = false)
              );
            }
          }
          // 401 apart from expired token
          else {
            authService.logout();
          }
        }
      }
      return throwError(() => err);
    })
  )
};

const addAuthenticationToken = (request: HttpRequest<unknown>, localStorageService: AuthStore) => {
// console.log removed
  const token = localStorageService.getAccessToken();
  if (!token) {
    return request;
  }

  return request.clone({
    setHeaders: { Authorization: `Bearer ${token.accessToken}` }
  });
};