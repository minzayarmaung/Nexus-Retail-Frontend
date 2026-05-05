import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_BASE_PATH } from '../../core/api/api-base-path';
import { ApiClientService } from '../../core/api/api-client.service';
import type { CreateShopOwnerRequest } from './shop-owner.model';

@Injectable({ providedIn: 'root' })
export class ShopOwnerApiService {
  private readonly api = inject(ApiClientService);
  private readonly baseUrl = `${API_BASE_PATH}/shops`;

  createOwner(payload: CreateShopOwnerRequest): Promise<void> {
    return firstValueFrom(this.api.post<void>(`${this.baseUrl}/owners`, payload, { withCredentials: true }));
  }
}

