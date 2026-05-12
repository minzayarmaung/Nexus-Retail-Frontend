import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners
} from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { authRefreshInterceptor } from './core/auth/auth-refresh.interceptor';
import { TranslateService } from './i18n/translate.service';
import { ThemeService } from './core/theme/theme.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch(), withInterceptors([authRefreshInterceptor])),
    provideAppInitializer(() => {
      const translate = inject(TranslateService);
      return translate.init();
    }),
    provideAppInitializer(() => inject(ThemeService).init())
  ]
};
