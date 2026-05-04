import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'nexus_retail_theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);

  readonly mode = signal<ThemeMode>('light');

  init(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const stored = this.safeReadStorage();
    if (stored === 'light' || stored === 'dark') {
      this.mode.set(stored);
    } else {
      const prefersDark =
        typeof window !== 'undefined'
          && typeof window.matchMedia === 'function'
          && window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.mode.set(prefersDark ? 'dark' : 'light');
    }

    this.applyModeToDom();
  }

  toggle(): void {
    this.setMode(this.mode() === 'dark' ? 'light' : 'dark');
  }

  setMode(mode: ThemeMode): void {
    this.mode.set(mode);
    this.applyModeToDom();
    this.safeWriteStorage(mode);
  }

  private applyModeToDom(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const root = this.document.documentElement;
    root.classList.toggle('dark', this.mode() === 'dark');
    root.style.colorScheme = this.mode();
  }

  private safeReadStorage(): string | null {
    try {
      return window.localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  }

  private safeWriteStorage(mode: ThemeMode): void {
    try {
      window.localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // ignore
    }
  }
}

