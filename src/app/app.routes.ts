import { Routes } from '@angular/router';
import { authUserGuard } from '@/app/core/guards/auth-user-guard';

export const routes: Routes = [
  {
    path: ':roomCode',
    canActivate: [authUserGuard],
    loadComponent: () => import('./pages/room/room-page').then((c) => c.RoomPage),
  },
  {
    path: '',
    loadComponent: () => import('./pages/home/home-page').then((c) => c.HomePage),
  },
];
