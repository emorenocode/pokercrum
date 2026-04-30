import { Room } from '@/app/core/models';
import { RoomService } from '@/app/pages/room/room-service';
import { Component, inject, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime } from 'rxjs';

@Component({
  selector: 'app-timer-field',
  imports: [ReactiveFormsModule],
  templateUrl: './timer-field.html',
  styleUrl: './timer-field.css',
})
export class TimerField implements OnInit {
  private readonly roomService = inject(RoomService);
  currentRoom = this.roomService.currentRoom();
  formValue = new FormControl<number>(0, { nonNullable: true });

  ngOnInit() {
    this.formValue.setValue(this.currentRoom?.timer ?? 0);

    this.formValue.valueChanges.pipe(debounceTime(500)).subscribe((val) => {
      if (val !== null && val >= 0) {
        this.onSave();
      }
    });
  }

  onSave() {
    const updatedRoom: Room = {
      ...this.currentRoom!,
      timer: this.formValue.value,
    };
    this.roomService.updateRoom(updatedRoom).subscribe(() => {
      console.log('Room updated successfully');
    });
  }
}
