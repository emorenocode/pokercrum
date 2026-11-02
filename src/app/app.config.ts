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
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getDatabase, provideDatabase } from '@angular/fire/database';

export const appConfig: ApplicationConfig = {
  providers: [
    ScreenTrackingService,
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideNgxSkeletonLoader(),
    provideRouter(routes, withComponentInputBinding()),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAnalytics(() => getAnalytics()),
    provideFirestore(() => getFirestore()),
    provideDatabase(() => getDatabase()),
    provideAuth(() => getAuth()),
    provideAppCheck(() => {
      return initializeAppCheck(getApp(), {
        provider: new ReCaptchaV3Provider(environment.reCaptchaV3SiteKey),
        isTokenAutoRefreshEnabled: true,
      });
    }),
  ],
};
