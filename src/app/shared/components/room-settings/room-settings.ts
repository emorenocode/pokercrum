import { Component } from '@angular/core';
import { TimerField } from '../timer-field/timer-field';

@Component({
  selector: 'app-room-settings',
  imports: [TimerField],
  templateUrl: './room-settings.html',
  styleUrl: './room-settings.css',
})
export class RoomSettings {}
