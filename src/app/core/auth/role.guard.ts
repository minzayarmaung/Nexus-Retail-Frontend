import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import type { UserRole } from '../user/user.model';
import { SessionService } from '../user/session.service';

export const roleGuard: CanActivateFn = (route) => {
  const session = inject(SessionService);
  const router = inject(Router);
  const role = session.user()?.role;
  const allowed = (route.data?.['roles'] as UserRole[] | undefined) ?? [];

  if (role && allowed.includes(role)) {
    return true;
  }
  return router.parseUrl('/dashboard');
};

