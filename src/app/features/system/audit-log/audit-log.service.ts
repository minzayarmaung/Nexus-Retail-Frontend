import { inject, Injectable, signal } from '@angular/core';
import { AuditLogApiService } from './audit-log.api';
import {
  mapAuditLogDto,
  type AuditLogRow,
  type AuditSearchFilters,
} from './audit-log.model';

@Injectable({ providedIn: 'root' })
export class AuditLogService {
  private readonly api = inject(AuditLogApiService);

  private readonly _rows = signal<AuditLogRow[]>([]);
  readonly rows = this._rows.asReadonly();

  readonly page = signal(0);
  readonly pageSize = signal(20);
  readonly totalElements = signal(0);
  readonly totalPages = signal(0);

  readonly loadState = signal<'idle' | 'loading' | 'ready' | 'error'>('idle');
  readonly loadError = signal<string | null>(null);

  readonly filters = signal<AuditSearchFilters>({});

  async search(filters?: AuditSearchFilters, page = 0): Promise<void> {
    if (filters) {
      this.filters.set({ ...filters });
    }
    this.page.set(page);
    this.loadState.set('loading');
    this.loadError.set(null);

    try {
      const res = await this.api.searchAuditLogs(this.filters(), {
        page: this.page(),
        size: this.pageSize(),
      });
      this._rows.set((res.content ?? []).map(mapAuditLogDto));
      this.totalElements.set(res.totalElements ?? 0);
      this.totalPages.set(Math.max(1, res.totalPages ?? 1));
      this.page.set(res.number ?? page);
      this.loadState.set('ready');
    } catch (e) {
      this.loadError.set(e instanceof Error ? e.message : 'Failed to load audit logs');
      this.loadState.set('error');
      this._rows.set([]);
    }
  }

  async nextPage(): Promise<void> {
    const next = this.page() + 1;
    if (next >= this.totalPages()) return;
    await this.search(undefined, next);
  }

  async prevPage(): Promise<void> {
    const prev = this.page() - 1;
    if (prev < 0) return;
    await this.search(undefined, prev);
  }
}
