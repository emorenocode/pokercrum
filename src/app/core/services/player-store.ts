import { inject, Injectable, signal } from '@angular/core';
import { Player } from '@/app/core/models';
import { DetectDevice } from '@/app/core/services/detect-device';
import { Logger } from '@/app/core/services/logger';
import { PlayerApi } from '@/app/core/services/player-api';

@Injectable({
  providedIn: 'root',
})
export class PlayerStore {
  private readonly detectDevice = inject(DetectDevice);
  private readonly playerApi = inject(PlayerApi);
  private readonly logger = inject(Logger);

  readonly player = signal<Player>({
    username: '',
    id: '',
    fromMobile: this.detectDevice.isMobile,
    isOnline: true,
  });

  constructor() {
    this.getPlayerFromLocalStorage();
  }

  async getPlayer() {
    this.logger.debug('player.get', { playerId: this.player().id });
    this.playerApi.getPlayer(this.player().id).subscribe({
      next: (playerDoc) => {
        this.logger.debug('player.get.response', {
          playerId: this.player().id,
          playerDoc: playerDoc.data(),
        });
        if (playerDoc.exists()) {
          this.logger.debug('player.get.found', { playerId: this.player().id });
          const playerData = playerDoc.data() as Player;
          this.player.set(playerData);
          this.logger.debug('player.get.success', { player: playerData });
        } else {
          this.logger.warn('player.get.not-found', { playerId: this.player().id });
          this.getPlayerFromLocalStorage();
        }
      },
      error: (error) => {
        this.logger.error('player.get.error', error, { playerId: this.player().id });
        this.getPlayerFromLocalStorage();
      },
    });
  }

  private getPlayerFromLocalStorage() {
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
        this.logger.warn('player.get.localStorage.legacy', { player });
        this.savePlayer(player);
      } catch (error) {}
    }

    this.logger.debug('player.get.localStorage', { player });

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
      this.logger.error('Error saving player data to localStorage:', error);
    }

    this.playerApi.savePlayer(player).subscribe({
      next: () => {
        this.logger.debug('player.saved', { player });
      },
      error: (error) => {
        this.logger.error('player.save.error', error, { player });
      },
    });
  }
}
