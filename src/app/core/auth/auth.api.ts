import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_BASE_PATH } from '../api/api-base-path';
import { ApiClientService } from '../api/api-client.service';
import type { LoginRequest, LoginResponse } from './auth.model';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly api = inject(ApiClientService);
  private readonly baseUrl = `${API_BASE_PATH}/auth`;

  login(payload: LoginRequest): Promise<LoginResponse> {
    return firstValueFrom(
      this.api.post<LoginResponse>(`${this.baseUrl}/login`, payload, { withCredentials: true }),
    );
  }

  logout(): Promise<void> {
    return firstValueFrom(
      this.api.post<void>(`${this.baseUrl}/logout`, undefined, { withCredentials: true }),
    );
  }
}

