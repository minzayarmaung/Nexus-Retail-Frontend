import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, type Observable } from 'rxjs';
import { API_BASE_PATH } from '../../core/api/api-base-path';
import type { ApiResponse } from '../../core/api/api-response';
import type { CreateRoleRequest, RoleApiDto, RoleDetailApiDto, UpdateRoleBodyRequest } from './roles.model';

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

  createRole(payload: CreateRoleRequest): Observable<RoleDetailApiDto> {
    return this.http
      .post<RoleDetailApiDto | ApiResponse<RoleDetailApiDto>>(this.rolesUrl, payload)
      .pipe(map((body) => this.unwrapRoleDetail(body)));
  }

  updateRole(id: number, payload: UpdateRoleBodyRequest): Observable<RoleDetailApiDto> {
    return this.http
      .patch<RoleDetailApiDto | ApiResponse<RoleDetailApiDto>>(`${this.rolesUrl}/${id}`, payload)
      .pipe(map((body) => this.unwrapRoleDetail(body)));
  }

  getRoleById(id: number): Observable<RoleDetailApiDto> {
    return this.http
      .get<RoleDetailApiDto | ApiResponse<RoleDetailApiDto>>(`${this.rolesUrl}/${id}`)
      .pipe(map((body) => this.unwrapRoleDetail(body)));
  }

  private unwrapRoleDetail(body: RoleDetailApiDto | ApiResponse<RoleDetailApiDto>): RoleDetailApiDto {
    if (this.isRoleDetailDto(body)) {
      return body;
    }
    const isSuccess = !!body && (body.success === 1 || body.code === 0);
    if (!isSuccess) {
      throw new Error(body?.message ?? 'Request failed');
    }
    const data = body.data;
    if (!this.isRoleDetailDto(data)) {
      throw new Error('Invalid role response');
    }
    return data;
  }

  private isRoleDetailDto(value: unknown): value is RoleDetailApiDto {
    if (!value || typeof value !== 'object') return false;
    const v = value as Partial<RoleDetailApiDto>;
    return (
      typeof v.id === 'number' &&
      typeof v.name === 'string' &&
      'description' in v &&
      typeof v.is_disabled === 'boolean'
    );
  }
}
