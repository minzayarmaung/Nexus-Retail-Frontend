import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { validateInternalReturnUrl } from './auth-return-url';
import { SessionService } from '../user/session.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const session = inject(SessionService);
  const router = inject(Router);
  if (session.isAuthenticated()) {
    return true;
  }
  return router.createUrlTree(['/auth/login'], { queryParams: { returnUrl: state.url } });
};

export const guestGuard: CanActivateFn = (_route, state) => {
  const session = inject(SessionService);
  const router = inject(Router);
  if (!session.isAuthenticated()) {
    return true;
  }
  const tree = router.parseUrl(state.url);
  const raw = tree.queryParams['returnUrl'];
  const param = typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : null;
  const returnUrl = validateInternalReturnUrl(param);
  if (returnUrl) {
    return router.parseUrl(returnUrl);
  }
  return router.parseUrl('/dashboard');
};
