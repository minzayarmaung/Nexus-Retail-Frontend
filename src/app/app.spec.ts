import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { routes } from './app.routes';
import {
  TranslateService,
  type AppLanguage
} from './core/i18n/translate.service';

class StubTranslateService {
  readonly language = signal<AppLanguage>('en');

  init(): Promise<void> {
    return Promise.resolve();
  }

  async loadLanguage(lang: AppLanguage): Promise<void> {
    this.language.set(lang);
  }

  instant(key: string): string {
    return key;
  }

  t(key: string): string {
    return key;
  }
}

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter(routes),
        { provide: TranslateService, useClass: StubTranslateService }
      ]
    }).compileComponents();
  });

  it('should create the app', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
