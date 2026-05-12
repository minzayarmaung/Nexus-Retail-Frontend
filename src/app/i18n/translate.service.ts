import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { firstValueFrom } from 'rxjs';

export type AppLanguage = 'en' | 'my';

function getNested(obj: unknown, path: string): string {
  const parts = path.split('.');
  let cur: unknown = obj;
  for (const p of parts) {
    if (cur !== null && typeof cur === 'object' && p in cur) {
      cur = (cur as Record<string, unknown>)[p];
    } else {
      return path;
    }
  }
  return typeof cur === 'string' ? cur : path;
}

const LANG_KEY = 'nexus-lang';

@Injectable({ providedIn: 'root' })
export class TranslateService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly bundle = signal<Record<string, unknown>>({});
  readonly language = signal<AppLanguage>('en');

  async init(): Promise<void> {
    let lang: AppLanguage = 'en';
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem(LANG_KEY) as AppLanguage | null;
      if (stored === 'my' || stored === 'en') {
        lang = stored;
      }
    }
    await this.loadLanguage(lang);
  }

  async loadLanguage(lang: AppLanguage): Promise<void> {
    const data = await firstValueFrom(
      this.http.get<Record<string, unknown>>(`/i18n/${lang}.json`)
    );
    this.bundle.set(data);
    this.language.set(lang);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(LANG_KEY, lang);
      document.documentElement.lang = lang;
      document.body.classList.toggle('lang-my', lang === 'my');
    }
  }

  instant(key: string): string {
    return getNested(this.bundle(), key);
  }

  /** Reactive read for pipes / templates */
  t(key: string): string {
    this.language();
    this.bundle();
    return getNested(this.bundle(), key);
  }
}
