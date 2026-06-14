import { Player } from '@/app/core/models';
import { Injectable, signal } from '@angular/core';
import { nanoid } from 'nanoid';

@Injectable({
  providedIn: 'root',
})
export class PlayerStore {
  readonly player = signal<Player>({
    username: '',
    id: nanoid(),
  });

  constructor() {
    this.getPlayer();
  }

  getPlayer() {
    const playerStored = localStorage.getItem('pcUser');
    let player;

    if (!playerStored) return;

    try {
      const playerDecoded = atob(playerStored);
      const playerToBytes = Uint8Array.from(playerDecoded, (char) => char.charCodeAt(0));
      const playerToString = new TextDecoder().decode(playerToBytes);
      player = JSON.parse(playerToString);
    } catch (error) {
      try {
        player = JSON.parse(playerStored);
        this.savePlayer(player);
      } catch (error) {}
    }

    if (!player) return;

    this.player.set(player);
  }

  savePlayer(player: Player) {
    try {
      const playerToString = JSON.stringify(player);
      const playerToBytes = new TextEncoder().encode(playerToString);
      const playerToBinString = Array.from(playerToBytes, (byte) => String.fromCharCode(byte)).join(
        '',
      );
      const data = btoa(playerToBinString);
      localStorage.setItem('pcUser', data);
    } catch (error) {
      console.error('Error saving player data to localStorage:', error);
    }
  }
}
