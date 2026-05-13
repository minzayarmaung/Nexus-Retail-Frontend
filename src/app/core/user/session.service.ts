import { isPlatformBrowser } from '@angular/common';
import {
  Injectable,
  PLATFORM_ID,
  computed,
  effect,
  inject,
  signal
} from '@angular/core';
import { AuthApiService } from '../auth/auth.api';
import { AuthTokenStore } from '../auth/auth-token.store';
import { normalizeRole } from '../auth/auth.model';
import type { SessionUser, UserRole } from './user.model';
import { DEFAULT_AVATAR_ID, type AvatarId } from './avatars';

const STORAGE_KEY = 'nexus-session-v1';

const DEMO_PRESETS: Record<
  UserRole,
  Pick<SessionUser, 'id' | 'username' | 'email' | 'displayName' | 'role'> & {
    avatarId: AvatarId;
  }
> = {
  system_admin: {
    id: 'demo-system-admin',
    username: 'sysadmin',
    email: 'platform.admin@nexus.local',
    displayName: 'Kyaw Zin',
    role: 'system_admin',
    avatarId: 'person-tie'
  },
  company_admin: {
    id: 'demo-company-admin',
    username: 'company.admin',
    email: 'admin@acme-retail.com',
    displayName: 'Su Su Han',
    role: 'company_admin',
    avatarId: 'person-smile'
  },
  store_manager: {
    id: 'demo-store-manager',
    username: 'store.mgr1',
    email: 'manager@acme-retail.com',
    displayName: 'Hla Myo',
    role: 'store_manager',
    avatarId: 'fox'
  },
  staff: {
    id: 'demo-staff',
    username: 'staff.nyi',
    email: 'nyi@acme-retail.com',
    displayName: 'Nyi Nyi',
    role: 'staff',
    avatarId: 'dog-happy'
  }
};

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly authApi = inject(AuthApiService);
  private readonly authTokenStore = inject(AuthTokenStore);

  private readonly _user = signal<SessionUser | null>(null);
  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => this._user() !== null);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as SessionUser;
          if (parsed?.id && parsed?.role) {
            this._user.set(parsed);
          }
        } catch {
          /* ignore */
        }
      }
    }

    effect(() => {
      const u = this._user();
      if (!isPlatformBrowser(this.platformId)) {
        return;
      }
      if (u) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    });
  }

  enterDemo(role: UserRole): void {
    this.authTokenStore.clear();
    const p = DEMO_PRESETS[role];
    this._user.set({
      id: p.id,
      username: p.username,
      email: p.email,
      displayName: p.displayName,
      role: p.role,
      avatarId: p.avatarId
    });
  }

  async login(credentials: { identity: string; password: string }): Promise<void> {
    const identity = credentials.identity.trim();
    const password = credentials.password;
    if (!identity) {
      throw new Error('Username or email is required');
    }
    if (!password.trim()) {
      throw new Error('Password is required');
    }

    const payload = identity.includes('@')
      ? { email: identity, password }
      : { username: identity, password };

    const res = await this.authApi.login(payload);
    this.authTokenStore.setAccessToken(res.token ?? null);
    this._user.set({
      id: String(res.userId),
      username: res.username || identity,
      email: res.email || '',
      displayName: res.username || identity,
      role: normalizeRole(res.role),
      avatarId: DEFAULT_AVATAR_ID,
    });
  }

  async logout(): Promise<void> {
    try {
      await this.authApi.logout();
    } finally {
      this.authTokenStore.clear();
      this._user.set(null);
    }
  }

  logoutLocal(): void {
    this.authTokenStore.clear();
    this._user.set(null);
  }

  updateProfile(patch: { username?: string; avatarId?: string }): void {
    const cur = this._user();
    if (!cur) {
      return;
    }
    const next: SessionUser = { ...cur };
    if (patch.username !== undefined) {
      next.username = patch.username.trim();
    }
    if (patch.avatarId !== undefined) {
      next.avatarId = patch.avatarId;
    }
    this._user.set(next);
  }
}
