import {
  Component,
  inject,
  OnDestroy,
  OnInit,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { RoomService } from '@/app/pages/room/room-service';
import { PlayerStore } from '@/app/core/services/player-store';
import { AuthService } from '@/app/core/services/auth-service';
import { Logger } from '@/app/core/services/logger';

@Component({
  selector: 'app-home',
  imports: [ReactiveFormsModule],
  templateUrl: './home-page.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './home-page.css',
})
export class HomePage implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly playerStore = inject(PlayerStore);
  private readonly onDestroy$ = new Subject<void>();
  private readonly snackbar = inject(MatSnackBar);
  private readonly roomService = inject(RoomService);
  private readonly router = inject(Router);
  private readonly logger = inject(Logger);
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
    const player = this.playerStore.player();
    this.logger.debug('home.check-my-rooms', { player });
    const roomCode = player.room;
    if (roomCode) {
      this.isCreatingRoom.set(true);
      this.router.navigate(['/', roomCode]).then(() => {
        this.isCreatingRoom.set(false);
      });
    }
  }

  async onCreateRoom() {
    if (this.isCreatingRoom()) return;

    this.isCreatingRoom.set(true);

    const username = this.username.value ?? '';
    if (this.username.invalid || username.trim() === '') {
      this.username.reset();
      this.username.markAllAsTouched();
      return;
    }

    const userAuthenticated = await this.authService.signInAnonymously();

    this.logger.info('auth.user', {
      userId: userAuthenticated.uid,
      player: this.playerStore.player(),
    });

    this.playerStore.player.update((player) => ({
      ...player,
      username: username.trim(),
      id: userAuthenticated.uid,
    }));

    this.roomService
      .createRoom(this.playerStore.player().username)
      .pipe(takeUntil(this.onDestroy$))
      .subscribe({
        next: (room) => {
          this.router.navigate(['/', room.id]);
        },
        error: () => {
          this.isCreatingRoom.set(false);
          this.snackbar.open('Error creating room', undefined, { duration: 3000 });
        },
      });
  }
}
