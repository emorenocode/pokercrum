import { inject, Service } from '@angular/core';
import { Logger } from '@/app/core/services/logger';
import { Auth, signInAnonymously } from '@angular/fire/auth';
import { PlayerStore } from '@/app/core/services/player-store';
import { PlayerApi } from '@/app/core/services/player-api';
import { Player } from '@/app/core/models/player.model';
import { from, map, switchMap } from 'rxjs';

@Service()
export class AuthService {
  private readonly logger = inject(Logger);
  private readonly auth = inject(Auth);
  private readonly playerStore = inject(PlayerStore);
  private readonly playerApi = inject(PlayerApi);

  constructor() {}

  login() {
    return from(this.signInAnonymously()).pipe(
      switchMap((user) => {
        return this.getPlayerFromApi(user.uid);
      }),
    );
  }

  async signInAnonymously() {
    await this.auth.authStateReady();

    const user = this.auth.currentUser;

    if (user) return user;

    const credential = await signInAnonymously(this.auth);

    return credential.user;
  }

  private getPlayerFromApi(userId: string) {
    return this.playerApi.getPlayer(userId).pipe(
      map((playerDoc) => {
        this.logger.debug('auth.get-player-doc', { playerId: userId, playerDoc: playerDoc.data() });
        const currentPlayer = this.playerStore.player();
        const player = playerDoc.exists()
          ? { ...currentPlayer, ...(playerDoc.data() as Player), oldId: currentPlayer.id }
          : { ...currentPlayer, oldId: currentPlayer.id, id: userId };

        this.playerStore.player.set(player);
        this.logger.debug('auth.get-player.stored', { playerId: userId, player });
        return player;
      }),
    );
  }
}
