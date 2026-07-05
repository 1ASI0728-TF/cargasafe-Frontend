import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { provideNativeDateAdapter } from '@angular/material/core';
import { authInterceptors } from './iam/infrastructure/auth-interceptor';
import { fakeBackendInterceptor } from './core/fake-backend/fake-backend.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideNativeDateAdapter(),
    provideRouter(routes),
    provideAnimationsAsync(),
    // authInterceptors runs first (attaches the fake bearer token), then
    // fakeBackendInterceptor resolves the request locally instead of
    // reaching out to any real network/backend.
    provideHttpClient(withInterceptors([authInterceptors, fakeBackendInterceptor])),
  ],
};
