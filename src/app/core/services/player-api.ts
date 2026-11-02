import { inject, Service } from '@angular/core';
import { doc, Firestore, getDoc, setDoc } from '@angular/fire/firestore';
import { from } from 'rxjs';
import { Player } from '@/app/core/models/player.model';

@Service()
export class PlayerApi {
  private readonly firestore = inject(Firestore);

  constructor() {}

  savePlayer(player: Player) {
    const playerRef = doc(this.firestore, 'players', player.id);
    return from(setDoc(playerRef, player));
  }

  getPlayer(playerId: string) {
    const playerRef = doc(this.firestore, 'players', playerId);
    return from(getDoc(playerRef));
  }
}
