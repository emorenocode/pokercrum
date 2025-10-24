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
  getDoc,
  onSnapshot,
  setDoc,
  updateDoc,
  writeBatch,
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class RoomService {
  private readonly firestore = inject(Firestore);
  private readonly newRoom = nanoid();
  private readonly _currentPlayer = signal<Player>({
    username: '',
    id: nanoid(),
  });

  constructor() {
    this.checkPlayer();
  }

  get currentPlayer() {
    return this._currentPlayer;
  }

  checkPlayer() {
    const playerStored = localStorage.getItem('pcUser');
    let player;

    if (!playerStored) return;

    try {
      const playerDecoded = atob(playerStored);
      player = JSON.parse(playerDecoded);
    } catch (error) {
      try {
        player = JSON.parse(playerStored);
        this.saveLocalData(player);
      } catch (error) {}
    }

    if (!player) return;

    this._currentPlayer.set(player);
  }

  getRoom(roomCode: string) {
    const roomRef = doc(this.firestore, 'rooms', roomCode);
    return from(getDoc(roomRef));
  }

  createRoom(username: string) {
    this._currentPlayer.update((player) => ({ ...player, username, room: this.newRoom }));

    const batch = writeBatch(this.firestore);
    const room = {
      id: this.newRoom,
      name: '',
      createdBy: this.currentPlayer().id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const roomRef = doc(this.firestore, 'rooms', this.newRoom);
    batch.set(roomRef, room);
    const playerRef = doc(
      this.firestore,
      'rooms',
      this.newRoom,
      'players',
      this.currentPlayer().id
    );
    batch.set(playerRef, this.currentPlayer());

    return from(batch.commit()).pipe(
      map(() => {
        this.saveLocalData(this.currentPlayer());
        return this.newRoom;
      })
    );
  }

  private saveLocalData(player: Player) {
    const data = btoa(JSON.stringify(player));
    localStorage.setItem('pcUser', data);
  }

  getPlayers(roomCode: string) {
    return from(collectionData(collection(this.firestore, 'rooms', roomCode, 'players')));
  }

  joinRoom(player: Player, roomCode: string) {
    return from(setDoc(doc(this.firestore, 'rooms', roomCode, 'players', player.id), player)).pipe(
      map(() => player),
      tap(() => {
        this.saveLocalData(player);
      })
    );
  }

  selectCard(roomCode: string, player: Player) {
    return from(setDoc(doc(this.firestore, 'rooms', roomCode, 'players', player.id), player));
  }

  onReveal(roomCode: string, show: boolean) {
    return from(updateDoc(doc(this.firestore, 'rooms', roomCode), { show, updatedAt: new Date() }));
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
      const playerUpdate: Player = { id: player.id, username: player.username };
      const playerRef = doc(this.firestore, 'rooms', roomCode, 'players', player.id);
      batch.set(playerRef, { ...playerUpdate });
    });

    const showRef = doc(this.firestore, 'rooms', roomCode);
    batch.update(showRef, { show: false, updatedAt: new Date() });

    return from(batch.commit());
  }

  onDeletePlayer(roomCode: string, playerId: string) {
    return from(deleteDoc(doc(this.firestore, 'rooms', roomCode, 'players', playerId)));
  }
}
