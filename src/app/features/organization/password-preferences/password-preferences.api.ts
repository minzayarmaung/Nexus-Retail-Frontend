import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_BASE_PATH } from '../../../core/api/api-base-path';
import type { PasswordValidationPolicyDto } from './password-preferences.model';

@Injectable({ providedIn: 'root' })
export class PasswordPreferencesApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_PATH}/organization/password-preferences`;

  getPasswordPreferences(): Promise<PasswordValidationPolicyDto[]> {
    return firstValueFrom(
      this.http.get<PasswordValidationPolicyDto[]>(this.baseUrl, {
        withCredentials: true,
      }),
    );
  }

  updatePasswordPreference(id: number): Promise<PasswordValidationPolicyDto> {
    return firstValueFrom(
      this.http.patch<PasswordValidationPolicyDto>(
        `${this.baseUrl}/${id}`,
        {},
        {
          withCredentials: true,
        },
      ),
    );
  }
}
