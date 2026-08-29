import { Component, inject, model, ChangeDetectionStrategy } from '@angular/core';
import { TimerField } from '../timer-field/timer-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { RoomService } from '@/app/pages/room/room-service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-room-settings',
  imports: [TimerField, MatCheckboxModule, FormsModule],
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
