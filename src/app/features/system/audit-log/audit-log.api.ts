import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_BASE_PATH } from '../../../core/api/api-base-path';
import type { AuditSearchFilters, SpringPage, AuditLogDto } from './audit-log.model';
import { toInstantParam } from './audit-log.model';

export interface AuditPageRequest {
  page: number;
  size: number;
  sort?: string;
}

@Injectable({ providedIn: 'root' })
export class AuditLogApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_PATH}/system/audit`;

  searchAuditLogs(
    filters: AuditSearchFilters,
    pageReq: AuditPageRequest,
  ): Promise<SpringPage<AuditLogDto>> {
    let params = new HttpParams()
      .set('page', String(pageReq.page))
      .set('size', String(pageReq.size));

    const sort = pageReq.sort ?? 'madeOnDate,desc';
    params = params.set('sort', sort);

    params = setIfPresent(params, 'action', filters.action);
    params = setIfPresent(params, 'entityName', filters.entityName);
    params = setIfPresent(params, 'makerName', filters.makerName);
    params = setIfPresent(params, 'processingResult', filters.processingResult);
    params = setIfPresent(params, 'actionMethod', filters.actionMethod);
    params = setIfPresent(params, 'browserName', filters.browserName);
    params = setIfPresent(params, 'deviceModel', filters.deviceModel);
    params = setIfPresent(params, 'operatingSystem', filters.operatingSystem);
    params = setIfPresent(params, 'operatingSystemVersion', filters.operatingSystemVersion);

    if (filters.entityId?.trim()) {
      params = params.set('entityId', filters.entityId.trim());
    }

    const from = toInstantParam(filters.from ?? '');
    const to = toInstantParam(filters.to ?? '');
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);

    return firstValueFrom(
      this.http.get<SpringPage<AuditLogDto>>(this.baseUrl, {
        params,
        withCredentials: true,
      }),
    );
  }
}

function setIfPresent(params: HttpParams, key: string, value?: string): HttpParams {
  const v = value?.trim();
  return v ? params.set(key, v) : params;
}
