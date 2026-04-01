import { CanMatchFn, Router ,Route , UrlSegment} from '@angular/router';
import { inject } from '@angular/core';
import { UserStore } from '../services/user-store';

export const userAccessGuard: CanMatchFn = (
  route: Route,
  _segments: UrlSegment[]
) => {
  const store = inject(UserStore);
  const router = inject(Router);

  if (!store.state.loaded) {
    return router.createUrlTree(['/login']);
  }

  const role = store.state.userRole;
  const data = route.data ?? {};

  if (data['restrictedUserTypes']?.includes(role)) {
    return router.createUrlTree(['/404']);
  }

  if (
    data['allowedUserTypes'] &&
    !data['allowedUserTypes'].includes(role)
  ) {
    return router.createUrlTree(['/404']);
  }

  return true;
};
