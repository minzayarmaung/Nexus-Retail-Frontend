import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import type { UserRole } from '../user/user.model';
import { DASHBOARD_LAYOUT_DEFAULTS } from './dashboard-layout.defaults';
import type { DashboardLayoutState } from './dashboard-layout.models';

const STORAGE_PREFIX = 'nexus-dashboard-layout-v1';

@Injectable({ providedIn: 'root' })
export class DashboardLayoutService {
  private readonly platformId = inject(PLATFORM_ID);

  load(userId: string, role: UserRole): DashboardLayoutState {
    const fallback = this.clone(DASHBOARD_LAYOUT_DEFAULTS[role]);
    if (!isPlatformBrowser(this.platformId)) return fallback;

    try {
      const raw = window.localStorage.getItem(this.key(userId, role));
      if (!raw) return fallback;
      const parsed = JSON.parse(raw) as DashboardLayoutState;
      if (parsed?.version !== 1 || parsed?.role !== role || !Array.isArray(parsed.items)) {
        return fallback;
      }
      return parsed;
    } catch {
      return fallback;
    }
  }

  save(userId: string, role: UserRole, state: DashboardLayoutState): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      window.localStorage.setItem(this.key(userId, role), JSON.stringify(state));
    } catch {
      // ignore
    }
  }

  resetToDefault(userId: string, role: UserRole): DashboardLayoutState {
    const next = this.clone(DASHBOARD_LAYOUT_DEFAULTS[role]);
    if (!isPlatformBrowser(this.platformId)) return next;
    try {
      window.localStorage.setItem(this.key(userId, role), JSON.stringify(next));
    } catch {
      // ignore
    }
    return next;
  }

  private key(userId: string, role: UserRole): string {
    return `${STORAGE_PREFIX}:${userId}:${role}`;
  }

  private clone<T>(v: T): T {
    return JSON.parse(JSON.stringify(v)) as T;
  }
}

