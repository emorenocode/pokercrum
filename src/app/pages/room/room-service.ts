import { inject, Injectable, signal } from '@angular/core';
import { finalize, from, map, Subject, switchMap, tap, throwError } from 'rxjs';
import { Player, Room } from '@/app/core/models';
import { nanoid } from 'nanoid';
import {
  canDeletePlayer,
  canRevealCards,
  isRoomOwner,
  isValidUsername,
  normalizeUsername,
} from './room-validation';
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
    const normalizedUsername = normalizeUsername(username);
    if (!isValidUsername(normalizedUsername)) {
      return throwError(() => new Error('Username is required and must be between 2 and 30 chars'));
    }

    const newRoom = nanoid();
    const currentPlayer = this.playerStore.player();
    const playerWithRoom = {
      ...currentPlayer,
      username: normalizedUsername,
      room: newRoom,
    };

    this.playerStore.player.set(playerWithRoom);

    const batch = writeBatch(this.firestore);
    const room: Room = {
      id: newRoom,
      name: '',
      timer: 30,
      timerEnd: 0,
      show: false,
      createdBy: currentPlayer.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      autoRevealCards: false,
    };
    const roomRef = doc(this.firestore, 'rooms', newRoom);
    batch.set(roomRef, room);
    const playerRef = doc(this.firestore, 'rooms', newRoom, 'players', currentPlayer.id);
    batch.set(playerRef, playerWithRoom);

    return from(batch.commit()).pipe(
      map(() => {
        this.playerStore.savePlayer(playerWithRoom);
        this.currentRoom.set(room);
        return room;
      }),
    );
  }

  getPlayers(roomCode: string) {
    return collectionData(collection(this.firestore, 'rooms', roomCode, 'players'));
  }

  joinRoom(player: Player, roomCode: string) {
    const normalizedUsername = normalizeUsername(player.username);
    if (!isValidUsername(normalizedUsername)) {
      return throwError(() => new Error('Username is required and must be between 2 and 30 chars'));
    }

    return this.getRoom(roomCode).pipe(
      switchMap((roomSnapshot) => {
        if (!roomSnapshot.exists()) {
          return throwError(() => new Error('Room not found'));
        }

        const playerToSave: Player = {
          ...player,
          username: normalizedUsername,
          room: roomCode,
        };

        return from(
          setDoc(doc(this.firestore, 'rooms', roomCode, 'players', playerToSave.id), playerToSave),
        ).pipe(
          tap(() => {
            this.playerStore.savePlayer(playerToSave);
          }),
          map(() => playerToSave),
        );
      }),
    );
  }

  selectCard(roomCode: string, player: Player) {
    const room = this.currentRoom();
    if (room?.show) {
      return throwError(() => new Error('Cards are already revealed'));
    }

    const playerWithRoom: Player = { ...player, room: roomCode };
    return from(
      setDoc(doc(this.firestore, 'rooms', roomCode, 'players', playerWithRoom.id), playerWithRoom),
    );
  }

  onReveal(roomCode: string, show: boolean) {
    const currentPlayer = this.playerStore.player();
    if (!canRevealCards(this.currentRoom(), currentPlayer)) {
      return throwError(() => new Error('Only the room owner can reveal cards'));
    }

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
    return docData(doc(this.firestore, 'rooms', roomCode)).pipe(
      tap((room) => {
        this.currentRoom.set(room as Room);
      }),
    );
  }

  onResetCards(roomCode: string, players: Player[]) {
    const currentPlayer = this.playerStore.player();
    if (!isRoomOwner(this.currentRoom(), currentPlayer)) {
      return throwError(() => new Error('Only the room owner can reset cards'));
    }

    const batch = writeBatch(this.firestore);
    players.forEach((player) => {
      const playerUpdate: Player = {
        ...player,
        card: null,
      };
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
    const currentPlayer = this.playerStore.player();
    if (!canDeletePlayer(this.currentRoom(), currentPlayer, playerId)) {
      return throwError(() => new Error('You are not allowed to delete this player'));
    }

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
