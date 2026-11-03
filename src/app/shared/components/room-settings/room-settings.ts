import { Component, inject, model, ChangeDetectionStrategy } from '@angular/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { RoomService } from '@/app/pages/room/room-service';
import { TimerField } from '../timer-field/timer-field';

@Component({
  selector: 'app-room-settings',
  imports: [TimerField, FormsModule, MatSlideToggleModule],
  templateUrl: './room-settings.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './room-settings.css',
})
export class RoomSettings {
  private readonly roomService = inject(RoomService);
  private room = this.roomService.currentRoom();
  readonly autoRevealCards = model<boolean>(this.room?.autoRevealCards ?? false);

  updateAutoRevealCards() {
    if (!this.room) return;
    this.room.autoRevealCards = this.autoRevealCards();
    this.roomService.updateRoom(this.room);
  }
}
