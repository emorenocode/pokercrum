import { inject, Injectable, signal } from '@angular/core';
import { from, map, Subject, tap } from 'rxjs';
import { Player } from './room-page';
import { nanoid } from 'nanoid';
import {
  collection,
  collectionData,
  deleteDoc,
  doc,
  Firestore,
  onSnapshot,
  setDoc,
  writeBatch,
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class RoomService {
  private readonly firestore = inject(Firestore);
  private newRoom = nanoid();

  _currentPlayer = signal<Player>({
    username: '',
    id: nanoid(),
    role: 'user',
  });

  get currentPlayer() {
    return this._currentPlayer;
  }

  createRoom(username: string) {
    this._currentPlayer.update((player) => ({ ...player, username, role: 'admin' }));
    localStorage.setItem(
      'pokercrum',
      JSON.stringify({ room: this.newRoom, player: this.currentPlayer() })
    );

    return from(
      setDoc(
        doc(this.firestore, 'rooms', this.newRoom, 'players', this.currentPlayer()!.id),
        this.currentPlayer()
      )
    ).pipe(map(() => this.newRoom));
  }

  getParticipants(roomCode: string) {
    return from(collectionData(collection(this.firestore, 'rooms', roomCode, 'players')));
  }

  joinRoom(player: Player, roomCode: string) {
    return from(setDoc(doc(this.firestore, 'rooms', roomCode, 'players', player.id), player)).pipe(
      map(() => player),
      tap(() => {
        localStorage.setItem('pokercrum', JSON.stringify({ room: roomCode, player }));
      })
    );
  }

  selectCard(roomCode: string, player: Player) {
    return from(setDoc(doc(this.firestore, 'rooms', roomCode, 'players', player.id), player));
  }

  onReveal(roomCode: string, show: boolean) {
    return from(setDoc(doc(this.firestore, 'rooms', roomCode), { show }));
  }

  getReveal(roomCode: string) {
    const observer = new Subject<boolean>();

    onSnapshot(doc(this.firestore, 'rooms', roomCode), (doc) => {
      if (doc.exists()) {
        observer.next(doc.data()['show']);
      }
    });

    return observer.asObservable();
  }

  onResetCards(roomCode: string, players: Player[]) {
    const batch = writeBatch(this.firestore);
    players.forEach((player) => {
      const playerUpdate: Player = { id: player.id, username: player.username, role: player.role };
      const playerRef = doc(this.firestore, 'rooms', roomCode, 'players', player.id);
      batch.set(playerRef, { ...playerUpdate });
    });

    const showRef = doc(this.firestore, 'rooms', roomCode);
    batch.set(showRef, { show: false });

    return from(batch.commit());
  }

  onDeletePlayer(roomCode: string, playerId: string) {
    return from(deleteDoc(doc(this.firestore, 'rooms', roomCode, 'players', playerId)));
  }
}
