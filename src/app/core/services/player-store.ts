import { inject, Injectable, signal } from '@angular/core';
import { nanoid } from 'nanoid';
import { Player } from '@/app/core/models';
import { DetectDevice } from '@/app/core/services/detect-device';

@Injectable({
  providedIn: 'root',
})
export class PlayerStore {
  private readonly detectDevice = inject(DetectDevice);

  readonly player = signal<Player>({
    username: '',
    id: nanoid(),
    fromMobile: this.detectDevice.isMobile,
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

    player.fromMobile = this.detectDevice.isMobile;

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
