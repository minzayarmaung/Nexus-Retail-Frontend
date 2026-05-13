import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthTokenStore {
  private readonly _accessToken = signal<string | null>(null);

  getAccessToken(): string | null {
    return this._accessToken();
  }

  setAccessToken(token: string | null | undefined): void {
    if (token?.trim()) {
      this._accessToken.set(token.trim());
    } else {
      this._accessToken.set(null);
    }
  }

  clear(): void {
    this._accessToken.set(null);
  }
}
