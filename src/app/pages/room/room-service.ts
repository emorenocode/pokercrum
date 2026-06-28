import { inject, Injectable, signal } from '@angular/core';
import { finalize, from, map, Subject, tap } from 'rxjs';
import { Player, Room } from '@/app/core/models';
import { nanoid } from 'nanoid';
import {
  collection,
  collectionData,
  deleteDoc,
  doc,
  docData,
  Firestore,
  getDoc,
  onSnapshot,
  setDoc,
  updateDoc,
  writeBatch,
} from '@angular/fire/firestore';
import { PlayerStore } from '@/app/core/services/player-store';

@Injectable({
  providedIn: 'root',
})
export class RoomService {
  private readonly playerStore = inject(PlayerStore);
  private readonly firestore = inject(Firestore);
  public readonly currentRoom = signal<Room | undefined>(undefined);

  getRoom(roomCode: string) {
    const roomRef = doc(this.firestore, 'rooms', roomCode);
    return from(getDoc(roomRef));
  }

  createRoom(username: string) {
    const newRoom = nanoid();
    this.playerStore.player.update((player) => {
      if (player.room) return player;
      return {
        ...player,
        username,
        room: newRoom,
      };
    });
    const currentPlayer = this.playerStore.player();

    const batch = writeBatch(this.firestore);
    const room: Room = {
      id: currentPlayer.room as string,
      name: '',
      timer: 30,
      timerEnd: 0,
      show: false,
      createdBy: currentPlayer.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const roomRef = doc(this.firestore, 'rooms', currentPlayer.room as string);
    batch.set(roomRef, room);
    const playerRef = doc(
      this.firestore,
      'rooms',
      currentPlayer.room as string,
      'players',
      currentPlayer.id,
    );
    batch.set(playerRef, currentPlayer);

    return from(batch.commit()).pipe(
      map(() => {
        this.playerStore.savePlayer(currentPlayer);
        this.currentRoom.set(room);
        return currentPlayer.room as string;
      }),
    );
  }

  getPlayers(roomCode: string) {
    return collectionData(collection(this.firestore, 'rooms', roomCode, 'players'));
  }

  joinRoom(player: Player, roomCode: string) {
    return from(setDoc(doc(this.firestore, 'rooms', roomCode, 'players', player.id), player)).pipe(
      map(() => player),
      tap(() => {
        this.playerStore.savePlayer(player);
      }),
    );
  }

  selectCard(roomCode: string, player: Player) {
    return from(setDoc(doc(this.firestore, 'rooms', roomCode, 'players', player.id), player));
  }

  onReveal(roomCode: string, show: boolean) {
    const currentPlayer = this.playerStore.player();
    const roomRef = doc(this.firestore, 'rooms', roomCode);
    const roomToUpdate = this.currentRoom()
      ? { ...this.currentRoom(), show, updatedAt: new Date(), timerEnd: 0 }
      : {
          show,
          name: '',
          id: roomCode,
          createdBy: currentPlayer.id,
          createdAt: new Date(),
          updatedAt: new Date(),
          timer: 30,
          timerEnd: 0,
        };
    const promise: Promise<void> = this.currentRoom()
      ? updateDoc(roomRef, roomToUpdate)
      : setDoc(roomRef, roomToUpdate);

    return from(promise);
  }

  getReveal(roomCode: string) {
    const observer = new Subject<any>();

    const unsubscribe = onSnapshot(doc(this.firestore, 'rooms', roomCode), (doc) => {
      if (doc.exists()) {
        observer.next(doc.data());
      }
    });

    return observer.asObservable().pipe(finalize(() => unsubscribe()));
  }

  onListenerRoom(roomCode: string) {
    return docData(doc(this.firestore, 'rooms', roomCode));
  }

  onResetCards(roomCode: string, players: Player[]) {
    const batch = writeBatch(this.firestore);
    players.forEach((player) => {
      const playerUpdate: Player = { id: player.id, username: player.username };
      const playerRef = doc(this.firestore, 'rooms', roomCode, 'players', player.id);
      batch.set(playerRef, { ...playerUpdate });
    });

    const showRef = doc(this.firestore, 'rooms', roomCode);
    batch.update(showRef, {
      show: false,
      updatedAt: new Date(),
      timerEnd: new Date().getTime() + (this.currentRoom()?.timer ?? 30) * 1000,
    });

    return from(batch.commit());
  }

  onDeletePlayer(roomCode: string, playerId: string) {
    return from(deleteDoc(doc(this.firestore, 'rooms', roomCode, 'players', playerId)));
  }

  updateRoom(updatedRoom: Room) {
    const roomRef = doc(this.firestore, 'rooms', updatedRoom.id);
    return from(updateDoc(roomRef, { ...updatedRoom, updatedAt: new Date() })).pipe(
      tap(() => {
        this.currentRoom.set(updatedRoom);
      }),
    );
  }
}
