import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAnalytics, provideAnalytics, ScreenTrackingService } from '@angular/fire/analytics';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding()),
    provideFirebaseApp(() =>
      initializeApp({
        projectId: 'pokercrum',
        appId: '1:634538708239:web:acf381aa82bfc60090427a',
        storageBucket: 'pokercrum.firebasestorage.app',
        apiKey: 'AIzaSyDhvHEu3OrbGZzdnu7htWYWJN6tgg8hJck',
        authDomain: 'pokercrum.firebaseapp.com',
        messagingSenderId: '634538708239',
        measurementId: 'G-NNCK2T8N4G',
      })
    ),
    provideAnalytics(() => getAnalytics()),
    ScreenTrackingService,
    provideFirestore(() => getFirestore()),
  ],
};
