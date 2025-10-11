import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/room/room-page').then((c) => c.RoomPage),
  },
];
