import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_BASE_PATH } from '../../core/api/api-base-path';
import { ApiClientService } from '../../core/api/api-client.service';
import type { CreateShopOwnerRequest, ShopOption, UserListItem } from './shop-owner.model';

@Injectable({ providedIn: 'root' })
export class ShopOwnerApiService {
  private readonly api = inject(ApiClientService);
  private readonly usersBaseUrl = `${API_BASE_PATH}/users`;
  private readonly shopsBaseUrl = `${API_BASE_PATH}/merchants`;
  private readonly merchantsBaseUrl = `${API_BASE_PATH}/merchants`;

  async listUsers(): Promise<UserListItem[]> {
    const res = await firstValueFrom(this.api.get<unknown>(this.usersBaseUrl, { withCredentials: true }));
    return this.toUsers(res);
  }

  async listShops(): Promise<ShopOption[]> {
    const res = await firstValueFrom(this.api.get<unknown>(this.shopsBaseUrl, { withCredentials: true }));
    return this.toShopOptions(res);
  }

  async searchShops(name: string): Promise<ShopOption[]> {
    const query = name.trim();
    if (!query) return this.listShops();
    const res = await firstValueFrom(this.api.get<unknown>(`${this.shopsBaseUrl}/search`, {
      withCredentials: true,
      params: { name: query }
    }));
    return this.toShopOptions(res);
  }

  createOwner(payload: CreateShopOwnerRequest): Promise<void> {
    return firstValueFrom(this.api.post<void>(`${this.merchantsBaseUrl}/owner`, payload, { withCredentials: true }));
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

  private toUsers(raw: unknown): UserListItem[] {
    const source = this.unwrapShopCollection(raw);
    if (!Array.isArray(source)) return [];
    return source
      .map((item: any): UserListItem | null => {
        const id = Number(item?.id ?? item?.userId);
        const username = String(item?.username ?? '').trim();
        const name = String(item?.name ?? item?.displayName ?? '').trim();
        if (!Number.isFinite(id) || !username || !name) return null;
        return {
          id,
          username,
          name,
          profileUrl: item?.profileUrl ? String(item.profileUrl) : undefined,
          email: item?.email ? String(item.email) : undefined,
          phoneNo: item?.phoneNo ? String(item.phoneNo) : undefined,
          shopId: item?.shopId != null ? Number(item.shopId) : undefined,
          shopName: item?.shopName ? String(item.shopName) : undefined,
        };
      })
      .filter((item): item is UserListItem => !!item);
  }
}

