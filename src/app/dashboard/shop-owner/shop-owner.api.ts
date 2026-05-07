import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_BASE_PATH } from '../../core/api/api-base-path';
import { ApiClientService } from '../../core/api/api-client.service';
import type { CreateShopOwnerRequest, ShopOption } from './shop-owner.model';

@Injectable({ providedIn: 'root' })
export class ShopOwnerApiService {
  private readonly api = inject(ApiClientService);
  private readonly baseUrl = `${API_BASE_PATH}/shops`;

  async listShops(): Promise<ShopOption[]> {
    const res = await firstValueFrom(this.api.get<unknown>(this.baseUrl, { withCredentials: true }));
    return this.toShopOptions(res);
  }

  async searchShops(name: string): Promise<ShopOption[]> {
    const query = name.trim();
    if (!query) return this.listShops();
    const res = await firstValueFrom(this.api.get<unknown>(`${this.baseUrl}/search`, {
      withCredentials: true,
      params: { name: query }
    }));
    return this.toShopOptions(res);
  }

  createOwner(payload: CreateShopOwnerRequest): Promise<void> {
    return firstValueFrom(this.api.post<void>(`${this.baseUrl}/owners`, payload, { withCredentials: true }));
  }

  private toShopOptions(raw: unknown): ShopOption[] {
    const source = this.unwrapShopCollection(raw);
    if (!Array.isArray(source)) return [];

    return source
      .map((item: any) => {
        const id = Number(item?.id);
        const name = String(item?.name ?? '').trim();
        if (!Number.isFinite(id) || !name) return null;
        return { id, name } satisfies ShopOption;
      })
      .filter((item): item is ShopOption => !!item);
  }

  private unwrapShopCollection(raw: any): unknown {
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

