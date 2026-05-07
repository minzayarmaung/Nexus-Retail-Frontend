import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, firstValueFrom, from, switchMap, throwError } from 'rxjs';
import { API_BASE_PATH } from '../api/api-base-path';
import { ApiClientService } from '../api/api-client.service';

let refreshPromise: Promise<void> | null = null;

function shouldSkipRefresh(url: string): boolean {
  return url.includes('/auth/login') || url.includes('/auth/logout') || url.includes('/auth/refresh');
}

export const authRefreshInterceptor: HttpInterceptorFn = (req, next) => {
  const api = inject(ApiClientService);
  const attempted = req.headers.get('x-refresh-attempted') === '1';

  return next(req).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || error.status !== 403 || attempted || shouldSkipRefresh(req.url)) {
        return throwError(() => error);
      }

      if (!refreshPromise) {
        refreshPromise = firstValueFrom(
          api.post<void>(`${API_BASE_PATH}/auth/refresh`, undefined, { withCredentials: true }),
        )
          .then(() => undefined)
          .finally(() => {
            refreshPromise = null;
          });
      }

      return from(refreshPromise).pipe(
        switchMap(() => {
          const retryReq = req.clone({
            withCredentials: true,
            setHeaders: { 'x-refresh-attempted': '1' },
          });
          return next(retryReq);
        }),
        catchError(refreshError => throwError(() => refreshError)),
      );
    }),
  );
};
