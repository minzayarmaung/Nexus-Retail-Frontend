import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, type Observable } from 'rxjs';
import type { ApiResponse } from './api-response';
import type { PaginatedApiResponse } from './paginated-api-response';
import type { PaginationRequest } from './pagination-request';

@Injectable({ providedIn: 'root' })
export class ApiClientService {
  private readonly http = inject(HttpClient);

  /**
   * Use absolute URL if needed, otherwise pass `/api/...`.
   */
  get<T>(url: string, options?: { params?: HttpParams | Record<string, string | number | boolean | null | undefined> }): Observable<T> {
    return this.http
      .get<ApiResponse<T>>(url, { params: options?.params as any })
      .pipe(map((res) => this.unwrap(res)));
  }

  post<T>(url: string, body?: unknown): Observable<T> {
    return this.http.post<ApiResponse<T>>(url, body).pipe(map((res) => this.unwrap(res)));
  }

  put<T>(url: string, body?: unknown): Observable<T> {
    return this.http.put<ApiResponse<T>>(url, body).pipe(map((res) => this.unwrap(res)));
  }

  delete<T>(url: string): Observable<T> {
    return this.http.delete<ApiResponse<T>>(url).pipe(map((res) => this.unwrap(res)));
  }

  getPaginated<T>(url: string, req: PaginationRequest): Observable<PaginatedApiResponse<T>> {
    const params = this.paginationParams(req);
    return this.http.get<PaginatedApiResponse<T>>(url, { params }).pipe(
      map((res) => {
        if (!res || res.success !== 1) {
          throw new Error(res?.message ?? 'Request failed');
        }
        return res;
      }),
    );
  }

  paginationParams(req: PaginationRequest): HttpParams {
    let params = new HttpParams();
    if (req.keyword) params = params.set('keyword', req.keyword);
    params = params.set('page', String(req.page));
    params = params.set('size', String(req.size));
    if (req.sortField) params = params.set('sortField', req.sortField);
    if (req.sortDirection) params = params.set('sortDirection', req.sortDirection);
    return params;
  }

  private unwrap<T>(res: ApiResponse<T>): T {
    if (!res || res.success !== 1) {
      throw new Error(res?.message ?? 'Request failed');
    }
    return res.data;
  }
}

