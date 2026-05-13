import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, type Observable } from 'rxjs';
import { API_BASE_PATH } from '../../core/api/api-base-path';
import type { ApiResponse } from '../../core/api/api-response';
import type { RoleApiDto } from './roles.model';

@Injectable({ providedIn: 'root' })
export class RolesApiService {
  private readonly http = inject(HttpClient);
  private readonly rolesUrl = `${API_BASE_PATH}/roles`;

  /**
   * GET /nexusretail/api/v1/roles — supports a raw JSON array or `{ success, data }` envelope.
   */
  getRoles(): Observable<RoleApiDto[]> {
    return this.http.get<RoleApiDto[] | ApiResponse<RoleApiDto[]>>(this.rolesUrl).pipe(
      map((body) => {
        if (Array.isArray(body)) {
          return body;
        }
        const isSuccess = !!body && (body.success === 1 || body.code === 0);
        if (!isSuccess) {
          throw new Error(body?.message ?? 'Request failed');
        }
        return body.data;
      }),
    );
  }
}
