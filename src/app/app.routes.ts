import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: ':roomCode',
    loadComponent: () => import('./pages/room/room-page').then((c) => c.RoomPage),
  },
  {
    path: '',
    loadComponent: () => import('./pages/home/home-page').then((c) => c.HomePage),
  },
];
