import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { API_BASE_PATH } from '../api/api-base-path';
import { environment } from '../../../environment/environment';
import { AuthTokenStore } from './auth-token.store';

function isNexusApiUrl(url: string): boolean {
  const base = environment.apiBaseUrl.replace(/\/$/, '');
  return url.startsWith(API_BASE_PATH) || url.startsWith(`${base}/nexusretail/api/v1`);
}

export const authRequestInterceptor: HttpInterceptorFn = (req, next) => {
  if (!isNexusApiUrl(req.url)) {
    return next(req);
  }

  const token = inject(AuthTokenStore).getAccessToken();
  if (token) {
    return next(
      req.clone({
        withCredentials: true,
        setHeaders: { Authorization: `Bearer ${token}` },
      }),
    );
  }
  return next(req.clone({ withCredentials: true }));
};
