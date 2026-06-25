import { inject, Injectable, signal } from '@angular/core';
import { PasswordPreferencesApiService } from './password-preferences.api';
import {
  mapPasswordValidationPolicyDto,
  type PasswordValidationPolicyData,
} from './password-preferences.model';

@Injectable({ providedIn: 'root' })
export class PasswordPreferencesService {
  private readonly api = inject(PasswordPreferencesApiService);

  private readonly _policies = signal<PasswordValidationPolicyData[]>([]);
  readonly policies = this._policies.asReadonly();

  readonly loadState = signal<'idle' | 'loading' | 'ready' | 'error'>('idle');
  readonly loadError = signal<string | null>(null);

  async loadPasswordPreferences(): Promise<void> {
    this.loadState.set('loading');
    this.loadError.set(null);

    try {
      const dtos = await this.api.getPasswordPreferences();
      this._policies.set(dtos.map(mapPasswordValidationPolicyDto));
      this.loadState.set('ready');
    } catch (e) {
      this.loadError.set(
        e instanceof Error ? e.message : 'Failed to load password preferences',
      );
      this.loadState.set('error');
      this._policies.set([]);
    }
  }

  async updatePasswordPreference(id: number): Promise<void> {
    this.loadState.set('loading');
    this.loadError.set(null);

    try {
      const dto = await this.api.updatePasswordPreference(id);
      // Update local state without reloading from API
      this._policies.set(
        this._policies().map((policy) =>
          policy.id === dto.id
            ? mapPasswordValidationPolicyDto(dto)
            : { ...policy, active: false },
        ),
      );
      this.loadState.set('ready');
    } catch (e) {
      this.loadError.set(
        e instanceof Error ? e.message : 'Failed to update password preference',
      );
      this.loadState.set('error');
    }
  }
}
