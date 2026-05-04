import { Injectable, signal } from '@angular/core';
import type { Toast, ToastVariant } from './toast.model';

const DEFAULT_DURATION_MS = 5500;

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();

  private readonly timers = new Map<string, ReturnType<typeof setTimeout>>();

  show(
    message: string,
    options?: { variant?: ToastVariant; durationMs?: number | null }
  ): string {
    const id = crypto.randomUUID();
    const variant = options?.variant ?? 'info';
    const durationMs =
      options?.durationMs === undefined ? DEFAULT_DURATION_MS : options.durationMs;

    this._toasts.update((list) => [...list, { id, message, variant }]);

    if (durationMs !== null && durationMs > 0) {
      const handle = setTimeout(() => this.dismiss(id), durationMs);
      this.timers.set(id, handle);
    }

    return id;
  }

  success(message: string, durationMs?: number | null): string {
    return this.show(message, { variant: 'success', durationMs });
  }

  error(message: string, durationMs?: number | null): string {
    return this.show(message, { variant: 'error', durationMs });
  }

  warning(message: string, durationMs?: number | null): string {
    return this.show(message, { variant: 'warning', durationMs });
  }

  info(message: string, durationMs?: number | null): string {
    return this.show(message, { variant: 'info', durationMs });
  }

  dismiss(id: string): void {
    const t = this.timers.get(id);
    if (t !== undefined) {
      clearTimeout(t);
      this.timers.delete(id);
    }
    this._toasts.update((list) => list.filter((toast) => toast.id !== id));
  }

  clear(): void {
    for (const id of this.timers.keys()) {
      const t = this.timers.get(id);
      if (t !== undefined) {
        clearTimeout(t);
      }
    }
    this.timers.clear();
    this._toasts.set([]);
  }
}
