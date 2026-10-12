import { Injectable, signal } from '@angular/core';
import { Card, Player, Room } from '@/app/core/models';

@Injectable({
  providedIn: 'root',
})
export class RoomState {
  readonly isInitialLoad = signal(true);
  readonly isLoadingRoom = signal(true);
  readonly showCards = signal(true);
  readonly players = signal<Player[]>([]);
  readonly cardSelected = signal<Card | undefined | null>(undefined);
  readonly timerEnd = signal(0);

  reset() {
    this.isInitialLoad.set(true);
    this.isLoadingRoom.set(true);
    this.showCards.set(true);
    this.cardSelected.set(undefined);
    this.players.set([]);
    this.timerEnd.set(0);
  }

  setPlayers(players: Player[]) {
    this.players.set(players);
  }

  syncCurrentPlayer(players: Player[], currentPlayerId: string) {
    const currentPlayer = players.find((player) => player.id === currentPlayerId);

    if (currentPlayer) {
      this.cardSelected.set(currentPlayer.card);
    }
  }

  autoRevealIfNeeded(room: Room | undefined, players: Player[]) {
    const allPlayersHaveCards = players.every((player) => player.card);
    const isAutoRevealEnabled = room?.autoRevealCards ?? false;

    if (!room || !isAutoRevealEnabled || (isAutoRevealEnabled && !allPlayersHaveCards)) {
      return;
    }

    this.showCards.set(true);
    this.timerEnd.set(0);
  }
}
