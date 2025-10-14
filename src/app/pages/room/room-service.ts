import { Injectable, signal } from '@angular/core';
import { map, timer } from 'rxjs';
import { User } from './room-page';
import { nanoid } from 'nanoid';

@Injectable({
  providedIn: 'root',
})
export class RoomService {
  _currentUser = signal<User | null>(null);

  get currentUser() {
    return this._currentUser;
  }

  createRoom(username: string) {
    this._currentUser.set({
      username,
      id: nanoid(),
      role: 'admin',
    });
    const newRoom = nanoid();
    localStorage.setItem('pokercrum', JSON.stringify({ room: newRoom, user: this.currentUser() }));

    return timer(1000).pipe(map(() => newRoom));
  }

  getParticipants() {}

  joinRoom(user: User, room: string) {
    return timer(2000).pipe(map(() => user));
  }
}
