import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_BASE_PATH } from '../../core/api/api-base-path';
import { ApiClientService } from '../../core/api/api-client.service';
import type { CreateShopRequest, ShopDetail, ShopSummary, UpdateShopRequest } from './shop.model';

@Injectable({ providedIn: 'root' })
export class ShopApiService {
  private readonly api = inject(ApiClientService);
  private readonly baseUrl = `${API_BASE_PATH}/merchants`;

  async list(): Promise<ShopSummary[]> {
    const raw = await firstValueFrom(this.api.get<unknown>(this.baseUrl + '/shops', { withCredentials: true }));
    return this.toShopList(raw);
  }

  async create(payload: CreateShopRequest): Promise<ShopDetail> {
    return firstValueFrom(this.api.post<ShopDetail>(this.baseUrl, payload, { withCredentials: true }));
  }

  async getById(id: number): Promise<ShopDetail> {
    return firstValueFrom(this.api.get<ShopDetail>(`${this.baseUrl}/${id}`, { withCredentials: true }));
  }

  async update(id: number, payload: UpdateShopRequest): Promise<ShopDetail> {
    return firstValueFrom(this.api.put<ShopDetail>(`${this.baseUrl}/${id}`, payload, { withCredentials: true }));
  }

  private toShopList(raw: unknown): ShopSummary[] {
    const source = this.unwrapCollection(raw);
    if (!Array.isArray(source)) return [];
    return source
      .map((item: any): ShopSummary | null => {
        const id = Number(item?.id);
        const name = String(item?.name ?? '').trim();
        if (!Number.isFinite(id) || !name) return null;
        const row: ShopSummary = { id, name };
        if (item?.type) row.type = String(item.type);
        if (item?.phoneNo) row.phoneNo = String(item.phoneNo);
        if (item?.shopPhotoUrl) row.shopPhotoUrl = String(item.shopPhotoUrl);
        return row;
      })
      .filter((item): item is ShopSummary => !!item);
  }

  private unwrapCollection(raw: any): unknown[] {
    if (Array.isArray(raw)) return raw;
    if (!raw || typeof raw !== 'object') return [];
    if (Array.isArray(raw.data)) return raw.data;
    if (Array.isArray(raw.items)) return raw.items;
    if (Array.isArray(raw.content)) return raw.content;
    if (raw.data && typeof raw.data === 'object') {
      if (Array.isArray(raw.data.items)) return raw.data.items;
      if (Array.isArray(raw.data.content)) return raw.data.content;
      if (Array.isArray(raw.data.shops)) return raw.data.shops;
    }
    return [];
  }
}
