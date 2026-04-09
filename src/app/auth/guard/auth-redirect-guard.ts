import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { of, switchMap } from 'rxjs';

export const authRedirectGuard: CanMatchFn = (route, segments) => {
  const router = inject(Router);
  let queryParam = '';
  queryParam += segments.join('/');

  return inject(AuthService).isAuthenticated().pipe(
    switchMap((authenticated) => {
      if (authenticated) {
        router.navigate(['/dashboard'], { queryParams: { redirectUrl: queryParam } });
        return of(false); 
      }
      return of(true);
    })
  );
};
