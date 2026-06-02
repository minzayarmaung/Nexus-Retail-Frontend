import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_BASE_PATH } from '../api/api-base-path';
import type { LoginRequest, LoginResponse } from './auth.model';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_PATH}/system/auth`;

  login(payload: LoginRequest): Promise<LoginResponse> {
    return firstValueFrom(this.http.post<unknown>(`${this.baseUrl}/login`, payload, { withCredentials: true })).then(
      (res) => normalizeLoginResponse(res),
    );
  }

  logout(): Promise<void> {
    return firstValueFrom(
      this.http.post<void>(`${this.baseUrl}/logout`, undefined, { withCredentials: true }),
    );
  }

  changePassword(userId: number, newPassword: string): Promise<void> {
    const url = `${this.baseUrl}/change-password/${userId}?newPassword=${encodeURIComponent(newPassword)}`;
    return firstValueFrom(this.http.patch<void>(url, null, { withCredentials: true }));
  }
}

function normalizeLoginResponse(res: unknown): LoginResponse {
  if (!res || typeof res !== 'object') {
    throw new Error('Invalid login response');
  }

  const raw = res as Record<string, unknown>;
  const data = raw['data'];
  const source = data && typeof data === 'object' ? (data as Record<string, unknown>) : raw;

  const roles = source['roles'];
  const normalizedRoles = Array.isArray(roles)
    ? roles.map((r) => (typeof r === 'string' ? r : '')).filter((r) => r.trim().length > 0)
    : [];

  return {
    token: asString(source['token']),
    username: asString(source['username']),
    email: asString(source['email']),
    roles: normalizedRoles,
    userId: asId(source['userId']),
    firstName: asOptionalString(source['firstName']),
    lastName: asOptionalString(source['lastName']),
    isFirstTimeLogin: asOptionalBoolean(source['isFirstTimeLogin']),
    isGeneratePassword: asOptionalBoolean(source['isGeneratePassword']),
  };
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function asOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function asOptionalBoolean(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined;
}

function asId(value: unknown): string | number {
  if (typeof value === 'string' || typeof value === 'number') {
    return value;
  }
  return '';
}

