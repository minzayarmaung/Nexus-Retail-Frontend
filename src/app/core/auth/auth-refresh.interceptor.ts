import { HttpClient, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, firstValueFrom, from, switchMap, throwError } from 'rxjs';
import { API_BASE_PATH } from '../api/api-base-path';
import { AuthTokenStore } from './auth-token.store';

let refreshPromise: Promise<void> | null = null;

function shouldSkipRefresh(url: string): boolean {
  return url.includes('/auth/login') || url.includes('/auth/logout') || url.includes('/auth/refresh');
}

function extractAccessToken(body: unknown): string | undefined {
  if (!body || typeof body !== 'object') {
    return undefined;
  }
  const o = body as Record<string, unknown>;
  const direct = o['token'] ?? o['accessToken'] ?? o['access_token'];
  if (typeof direct === 'string' && direct.trim()) {
    return direct;
  }
  const data = o['data'];
  if (data && typeof data === 'object') {
    const d = data as Record<string, unknown>;
    const t = d['token'] ?? d['accessToken'] ?? d['access_token'];
    if (typeof t === 'string' && t.trim()) {
      return t;
    }
  }
  return undefined;
}

export const authRefreshInterceptor: HttpInterceptorFn = (req, next) => {
  const http = inject(HttpClient);
  const tokenStore = inject(AuthTokenStore);
  const attempted = req.headers.get('x-refresh-attempted') === '1';

  return next(req).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse)) {
        return throwError(() => error);
      }
      const status = error.status;
      const shouldTryRefresh = status === 401 || status === 403;
      if (!shouldTryRefresh || attempted || shouldSkipRefresh(req.url)) {
        return throwError(() => error);
      }

      if (!refreshPromise) {
        const refreshUrl = `${API_BASE_PATH}/auth/refresh`;
        refreshPromise = firstValueFrom(
          http.post<unknown>(refreshUrl, null, {
            withCredentials: true,
            observe: 'body',
          }),
        )
          .then((body) => {
            const token = extractAccessToken(body);
            if (token) {
              tokenStore.setAccessToken(token);
            }
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      return from(refreshPromise).pipe(
        switchMap(() => {
          const headers: Record<string, string> = { 'x-refresh-attempted': '1' };
          const t = tokenStore.getAccessToken();
          if (t) {
            headers['Authorization'] = `Bearer ${t}`;
          }
          const retryReq = req.clone({
            withCredentials: true,
            setHeaders: headers,
          });
          return next(retryReq);
        }),
        catchError((refreshError) => throwError(() => refreshError)),
      );
    }),
  );
};
