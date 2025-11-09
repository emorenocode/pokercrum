import { Component, computed, inject } from '@angular/core';
import { RoomService } from '@/app/pages/room/room-service';
import { Player } from '@/app/pages/room/room-page';
import { Router } from '@angular/router';
import { OverlayContent } from '@/app/core/services/overlay-content';

@Component({
  selector: 'app-user-info',
  imports: [],
  templateUrl: './user-info.html',
  styleUrl: './user-info.css',
})
export class UserInfo {
  private readonly overlayContent = inject(OverlayContent);
  private readonly router = inject(Router);
  private readonly roomService = inject(RoomService);
  public readonly player = this.roomService.currentPlayer;
  public readonly currentRoom = computed(() => this.roomService.currentRoom());
  username?: string;
  invalidUsername = false;

  onInput(event: Event) {
    const text = (event.target as HTMLDivElement).innerText;
    if (this.isValid(text)) {
      this.username = text;
      this.invalidUsername = false;
    } else {
      this.invalidUsername = true;
    }
  }

  isValid(text: string) {
    return text.length < 20;
  }

  onBlur() {
    if (!this.username || this.username.trim() == '') return;
    const updatedPlayer: Player = { ...this.player(), username: this.username.trim() };
    this.roomService.updatePlayer(updatedPlayer);
  }

  goToRoom(roomCode?: string) {
    if (roomCode) {
      this.overlayContent.close();
      this.router.navigate(['/', roomCode]);
    }
  }

  createRoom() {
    this.roomService.createRoom(this.player().username).subscribe({
      next: (roomCode) => {
        this.goToRoom(roomCode);
      },
    });
  }
}
