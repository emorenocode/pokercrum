import { Component, inject } from '@angular/core';
import { RoomService } from '../room/room-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage {
  private readonly roomService = inject(RoomService);
  private readonly router = inject(Router);

  onCreateRoom() {
    this.roomService.createRoom().subscribe({
      next: (room) => {
        this.router.navigate(['/', room]);
      },
    });
  }
}
