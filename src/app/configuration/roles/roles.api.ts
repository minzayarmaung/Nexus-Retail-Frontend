import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, type Observable } from 'rxjs';
import { API_BASE_PATH } from '../../core/api/api-base-path';
import type { ApiResponse } from '../../core/api/api-response';
import type { CreateRoleRequest, RoleApiDto, UpdateRoleRequest } from './roles.model';

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

  createRole(payload: CreateRoleRequest): Observable<RoleApiDto> {
    return this.http
      .post<RoleApiDto | ApiResponse<RoleApiDto>>(this.rolesUrl, payload)
      .pipe(map((body) => this.unwrapOne(body)));
  }

  updateRole(payload: UpdateRoleRequest): Observable<RoleApiDto> {
    return this.http
      .patch<RoleApiDto | ApiResponse<RoleApiDto>>(this.rolesUrl, payload)
      .pipe(map((body) => this.unwrapOne(body)));
  }

  getRoleById(id: number): Observable<RoleApiDto> {
    return this.http
      .post<RoleApiDto | ApiResponse<RoleApiDto>>(`${this.rolesUrl}/${id}`, {})
      .pipe(map((body) => this.unwrapOne(body)));
  }

  private unwrapOne(body: RoleApiDto | ApiResponse<RoleApiDto>): RoleApiDto {
    if (this.isRoleDto(body)) {
      return body;
    }
    const isSuccess = !!body && (body.success === 1 || body.code === 0);
    if (!isSuccess) {
      throw new Error(body?.message ?? 'Request failed');
    }
    const data = body.data;
    if (!this.isRoleDto(data)) {
      throw new Error('Invalid role response');
    }
    return data;
  }

  private isRoleDto(value: unknown): value is RoleApiDto {
    if (!value || typeof value !== 'object') return false;
    const v = value as Partial<RoleApiDto>;
    return (
      typeof v.id === 'number' &&
      typeof v.name === 'string' &&
      'description' in v &&
      typeof v.is_disabled === 'boolean'
    );
  }
}
