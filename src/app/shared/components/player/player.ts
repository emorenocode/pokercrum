import { Component, computed, inject, input, output, ChangeDetectionStrategy } from '@angular/core';
import { Player } from '@/app/core/models/player.model';
import { PlayerStore } from '@/app/core/services/player-store';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'ui-player',
  imports: [MatTooltipModule],
  templateUrl: './player.html',
  changeDetection: ChangeDetectionStrategy.Eager,
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
