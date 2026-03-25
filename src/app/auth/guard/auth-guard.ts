import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { switchMap ,of } from 'rxjs';

export const authGuard: CanMatchFn = (route, segments) => {
  const router = inject(Router);
  let queryParam = '';
  queryParam += segments.join('/');

  return inject(AuthService).isAuthenticated().pipe(
    switchMap((authenticated) => {
      if (!authenticated) {
        if (queryParam) {
          router.navigate(['/login'], {
            queryParams: { returnUrl: queryParam },
          });
        }
        else {
          router.navigate(['/login']);
        }
      }
      return of(authenticated);
    })
  );
};
