import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { RoomService } from '@/app/pages/room/room-service';
import { Router } from '@angular/router';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { PlayerStore } from '@/app/core/services/player-store';

@Component({
  selector: 'app-home',
  imports: [ReactiveFormsModule],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage implements OnInit, OnDestroy {
  private readonly playerStore = inject(PlayerStore);
  private readonly onDestroy$ = new Subject<void>();
  private readonly snackbar = inject(MatSnackBar);
  private readonly roomService = inject(RoomService);
  private readonly router = inject(Router);
  public readonly username = new FormControl<string | null>(null, Validators.required);
  public readonly isCreatingRoom = signal(false);

  ngOnInit(): void {
    this.checkMyRooms();
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  checkMyRooms() {
    const roomCode = this.playerStore.player().room;
    if (roomCode) {
      this.router.navigate(['/', roomCode]);
    }
  }

  onCreateRoom() {
    if (this.isCreatingRoom()) return;

    this.isCreatingRoom.set(true);

    const username = this.username.value ?? '';
    if (this.username.invalid || username.trim() === '') {
      this.username.reset();
      this.username.markAllAsTouched();
      return;
    }

    this.roomService
      .createRoom(username)
      .pipe(takeUntil(this.onDestroy$))
      .subscribe({
        next: (room: string) => {
          this.router.navigate(['/', room]);
        },
        error: () => {
          this.isCreatingRoom.set(false);
          this.snackbar.open('Error creating room', undefined, { duration: 3000 });
        },
      });
  }
}
