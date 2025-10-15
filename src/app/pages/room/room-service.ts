import { inject, Injectable, signal } from '@angular/core';
import { from, map } from 'rxjs';
import { User } from './room-page';
import { nanoid } from 'nanoid';
import { collection, collectionData, doc, Firestore, setDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class RoomService {
  private readonly firestore = inject(Firestore);
  private readonly roomsCollection = collection(this.firestore, 'rooms');
  private newRoom = nanoid();

  _currentUser = signal<User>({
    username: '',
    id: nanoid(),
    role: 'user',
  });

  get currentUser() {
    return this._currentUser;
  }

  createRoom(username: string) {
    this._currentUser.update((user) => ({ ...user, username, role: 'admin' }));
    localStorage.setItem(
      'pokercrum',
      JSON.stringify({ room: this.newRoom, user: this.currentUser() })
    );

    return from(
      setDoc(
        doc(this.firestore, 'rooms', this.newRoom, 'players', this.currentUser()!.id),
        this.currentUser()
      )
    ).pipe(map(() => this.newRoom));
  }

  getParticipants(roomCode: string) {
    return from(collectionData(collection(this.firestore, 'rooms', roomCode, 'players')));
  }

  joinRoom(user: User, roomCode: string) {
    return from(setDoc(doc(this.firestore, 'rooms', roomCode, 'players', user.id), user)).pipe(
      map(() => user)
    );
  }

  selectCard(roomCode: string, user: User) {
    return from(setDoc(doc(this.firestore, 'rooms', roomCode, 'players', user.id), user));
  }
}
