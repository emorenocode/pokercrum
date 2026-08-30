import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import { getApp, initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAnalytics, provideAnalytics, ScreenTrackingService } from '@angular/fire/analytics';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { initializeAppCheck, provideAppCheck, ReCaptchaV3Provider } from '@angular/fire/app-check';
import { environment } from '../environments/environment';
import { provideNgxSkeletonLoader } from 'ngx-skeleton-loader';

export const appConfig: ApplicationConfig = {
  providers: [
    ScreenTrackingService,
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding()),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAppCheck(() => {
      return initializeAppCheck(getApp(), {
        provider: new ReCaptchaV3Provider(environment.reCaptchaV3SiteKey),
        isTokenAutoRefreshEnabled: true,
      });
    }),
    provideAnalytics(() => getAnalytics()),
    provideFirestore(() => getFirestore()),
    provideNgxSkeletonLoader(),
  ],
};
