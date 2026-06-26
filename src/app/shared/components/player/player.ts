import { Player } from '@/app/core/models/player.model';
import { PlayerStore } from '@/app/core/services/player-store';
import { Component, computed, inject, input, output } from '@angular/core';

@Component({
  selector: 'ui-player',
  imports: [],
  templateUrl: './player.html',
  styleUrl: './player.css',
})
export class UIPlayer {
  private readonly playerStore = inject(PlayerStore);
  currentPlayer = this.playerStore.player();
  player = input.required<Player>();
  isOwner = input<boolean>(false);
  showCards = input<boolean>(false);
  onDelete = output<string>();
  showDelete = computed(() => this.isOwner() && this.player().id !== this.currentPlayer.id);
}
