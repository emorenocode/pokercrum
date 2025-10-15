import { Component, inject, signal } from '@angular/core';
import { RoomService } from '../room/room-service';
import { Router } from '@angular/router';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-home',
  imports: [ReactiveFormsModule],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage {
  private readonly roomService = inject(RoomService);
  private readonly router = inject(Router);
  public readonly roomCode = new FormControl<string | null>(null, Validators.required);
  public readonly username = new FormControl<string | null>(null, Validators.required);
  public readonly isCreatingRoom = signal(false);

  onCreateRoom() {
    if (this.isCreatingRoom()) return;

    this.isCreatingRoom.set(true);

    const username = this.username.value ?? '';
    if (this.username.invalid || username.trim() === '') {
      this.username.reset();
      this.username.markAllAsTouched();
      return;
    }

    this.roomService.createRoom(username).subscribe({
      next: (room: any) => {
        console.log('Room ', room);
        this.router.navigate(['/', room]);
      },
    });
  }

  onJoinRoom() {
    throw new Error('Method not implemented.');
  }
}
