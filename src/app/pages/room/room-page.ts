import {
  Component,
  computed,
  effect,
  inject,
  input,
  OnDestroy,
  signal,
  ChangeDetectionStrategy,
  OnInit,
} from '@angular/core';
import { RoomService } from './room-service';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Header } from '@/app/shared/components/header/header';
import { map, of, retry, Subject, switchMap, takeUntil, throwError } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Countdown } from '@/app/shared/components/countdown/countdown';
import { Card, Player, Result, Room } from '@/app/core/models';
import { PlayerStore } from '@/app/core/services/player-store';
import { UICard } from '@/app/shared/components/card/card';
import { UIPlayer } from '@/app/shared/components/player/player';
import { NgxSkeletonLoaderComponent } from 'ngx-skeleton-loader';
import { Logger } from '@/app/core/services/logger';
import { AuthService } from '@/app/core/services/auth-service';
import { PlayerPresence } from '@/app/core/services/player-presence';

export function countCards(list: Player[]): Record<string, number> {
  return list.reduce(
    (acc, item) => {
      if (item.card?.value == null) return acc;

      const key = String(item.card?.value);
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
}

const CARDS: Card[] = [
  { value: '0', label: 'No effort (already done or trivial)' },
  { value: '1/2', label: 'Tiny effort (almost nothing)' },
  { value: '1', label: 'Very small effort (quick change)' },
  { value: '2', label: 'Small effort (simple task)' },
  { value: '3', label: 'Medium effort (moderate complexity)' },
  { value: '5', label: 'Medium to large effort (some complexity)' },
  { value: '8', label: 'Large effort (complex or multi-step)' },
  { value: '13', label: 'Very large effort (significant work)' },
  { value: '20', label: 'Huge effort (requires planning)' },
  { value: '40', label: 'Massive effort (multiple sprints)' },
  { value: '100', label: 'Enormous effort (likely needs to be split)' },
  { value: '?', label: 'Unclear — needs clarification before estimating' },
  { value: '♾️', label: 'Too big to estimate — break it down' },
  { value: '☕️', label: 'Time for a break ☕️' },
];

@Component({
  selector: 'app-room',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatTooltipModule,
    Header,
    MatIconModule,
    Countdown,
    UICard,
    UIPlayer,
    NgxSkeletonLoaderComponent,
    MatProgressSpinnerModule,
  ],
  templateUrl: './room-page.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './room-page.css',
})
export class RoomPage implements OnDestroy, OnInit {
  private readonly metaTitle = inject(Title);
  private readonly onDestroy$ = new Subject<void>();
  private readonly snackbar = inject(MatSnackBar);
  private readonly roomService = inject(RoomService);
  private readonly isInitialLoad = signal(true);
  private readonly router = inject(Router);
  private readonly playerStore = inject(PlayerStore);
  private readonly logger = inject(Logger);
  private readonly authService = inject(AuthService);
  private readonly playerPresence = inject(PlayerPresence);
  readonly status$ = this.playerPresence.status$;

  protected readonly cards: Card[] = CARDS;
  protected readonly isOwner = computed(() => {
    const room = this.roomService.currentRoom();
    return room?.createdBy === this.player().id || room?.createdBy === this.player().oldId;
  });
  protected readonly resultList = computed<Result[]>(() => {
    if (!this.showCards()) return [];

    const result = countCards(this.players());

    return Object.entries(result)
      .map(([card, vote]) => ({
        vote,
        card,
        label: `( ${vote} vote${vote > 1 ? 's' : ''} )`,
      }))
      .sort((a, b) => a.vote - b.vote);
  });

  public readonly isLoadingRoom = signal(true);
  public readonly showCards = signal(true);
  public readonly players = signal<Player[]>([]);
  public readonly cardSelected = signal<Card | undefined | null>(undefined);
  public readonly player = this.playerStore.player;
  public readonly roomCode = input.required<string>();
  public readonly username = new FormControl<string>('', {
    nonNullable: true,
    validators: [Validators.required],
  });
  public readonly currentRoom = this.roomService.currentRoom;
  public readonly timerEnd = signal(0);
  public readonly totalPlayers = computed(() => {
    return !this.isLoadingRoom() && this.players().length > 0
      ? ' (' + this.players().length + ')'
      : '';
  });
  public readonly showDeleteAllPlayerButton = computed(() => {
    return !this.isLoadingRoom() && this.players().length > 0 && this.isOwner();
  });
  public readonly onlineUsers = signal<string[]>([]);

  constructor() {
    effect(() => {
      const room = this.roomCode();
      if (!room) return;
      this.resetRoomState();
      this.startRoom();
    });
  }

  ngOnInit(): void {
    this.startPlayerPresence();
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
    this.stopPlayerPresence();
  }

  startPlayerPresence() {
    this.logger.debug('player.presence.starting', {
      roomCode: this.roomCode(),
      player: this.player(),
    });
    this.playerPresence
      .start(this.roomCode())
      .then(() => {
        this.logger.debug('player.presence.started', {
          roomCode: this.roomCode(),
          player: this.player(),
        });
        this.playerPresence
          .watchOnlineUsers(this.roomCode())
          .pipe(takeUntil(this.onDestroy$))
          .subscribe({
            next: (onlineUsers) => {
              this.onlineUsers.set(onlineUsers);
              this.updatePlayerPresence(onlineUsers);
            },
            error: (error) => {
              this.logger.error('player.presence.watchOnlineUsers.error', error, {
                roomCode: this.roomCode(),
                player: this.player(),
              });
            },
          });
      })
      .catch((error) => {
        this.logger.error('player.presence.start.error', error, {
          roomCode: this.roomCode(),
          player: this.player(),
        });
      });
  }

  private updatePlayerPresence(onlineUsers: string[]) {
    this.players.update((players) => {
      return players.map((player) => ({
        ...player,
        isOnline: onlineUsers.includes(player.id),
      }));
    });
  }

  stopPlayerPresence() {
    this.playerPresence
      .stop()
      .then(() => {
        this.logger.debug('player.presence.stopped', {
          roomCode: this.roomCode(),
          player: this.player(),
        });
      })
      .catch((error) => {
        this.logger.error('player.presence.stop.error', error, {
          roomCode: this.roomCode(),
          player: this.player(),
        });
      });
  }

  private startRoom() {
    this.getPlayers();
    this.onListenerRoom();
  }

  private resetRoomState() {
    this.onDestroy$.next();
    this.cardSelected.set(undefined);
    this.showCards.set(true);
    this.isInitialLoad.set(true);
    this.isLoadingRoom.set(true);
  }

  private onListenerRoom() {
    this.roomService
      .onListenerRoom(this.roomCode())
      .pipe(
        retry(3),
        switchMap((room) => {
          this.logger.debug('room.listener', { roomCode: this.roomCode(), room });
          if (!room && this.player().room === this.roomCode()) {
            this.logger.debug('room.not-found', {
              roomCode: this.roomCode(),
              player: this.player(),
            });
            return this.roomService.createRoom(this.player().username);
          } else if (!room) {
            return throwError(() => new Error('Room not found'));
          }

          return of(room);
        }),
        switchMap((room) => {
          const roomData = room as Room;
          if (!this.isInitialLoad()) return of(roomData);
          if (this.player().username.trim() === '') return of(roomData);

          const currentPlayer = this.getCurrentPlayer();
          if (currentPlayer) {
            this.cardSelected.set(currentPlayer.card);
            this.playerStore.player.update((player) => ({
              ...player,
              ...currentPlayer,
            }));
          }

          return this.roomService.joinRoom(this.roomCode()).pipe(map(() => roomData));
        }),
        takeUntil(this.onDestroy$),
      )
      .subscribe({
        next: (room) => {
          this.timerEnd.set(room.timerEnd);
          this.showCards.set(room.show);
          this.isInitialLoad.set(false);
          this.isLoadingRoom.set(false);
          this.onAutoRevealCardsChange(this.players());
        },
        error: () => {
          this.snackbar.open(`Room ${this.roomCode()} not found`, undefined, {
            duration: 3000,
          });
          this.router.navigate(['/']);
        },
      });
  }

  private getCurrentPlayer() {
    return this.players().find((player) => player.id === this.player().id);
  }

  private getPlayers() {
    this.roomService
      .getPlayers(this.roomCode())
      .pipe(takeUntil(this.onDestroy$))
      .subscribe({
        next: (qs) => {
          const players = qs as unknown as Player[];
          if (players.length === 0) return;

          this.players.set(players);
          const currentPlayer = this.getCurrentPlayer();
          if (currentPlayer) {
            this.cardSelected.set(currentPlayer.card);
          }
          const roomOwner =
            this.player().room === this.roomCode()
              ? this.player()
              : this.players().find(
                  (player) =>
                    player.room === this.roomCode() || this.currentRoom()?.createdBy === player.id,
                );

          this.metaTitle.setTitle(`PokerCrum Room of ${roomOwner?.username}`);
          this.onAutoRevealCardsChange(players);
          this.updatePlayerPresence(this.onlineUsers());
        },
        error: () => {
          this.snackbar.open('Error to get players', undefined, { duration: 3000 });
        },
      });
  }

  onAutoRevealCardsChange(players: Player[]) {
    const room = this.currentRoom();
    const allPlayersHaveCards = players.every((player) => player.card);
    const isAutoRevealEnabled = room?.autoRevealCards ?? false;

    if (!room || !isAutoRevealEnabled || (isAutoRevealEnabled && !allPlayersHaveCards)) return;

    this.showCards.set(true);
    this.timerEnd.set(0);
  }

  async onJoinRoom() {
    const username = this.username.value;
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

    this.roomService.joinRoom(this.roomCode()).subscribe({
      next: (res) => {
        // this.player.set(player);
        this.logger.debug('room.joined', { roomCode: this.roomCode(), player: this.player(), res });
      },
      error: () => {
        this.snackbar.open('Error to join room', undefined, { duration: 3000 });
      },
    });
  }

  onSelectCard(card: Card) {
    if (this.showCards()) return;

    this.cardSelected.set(card);
    const user = { ...this.player(), card } as Player;
    this.roomService.selectCard(this.roomCode(), user).subscribe({
      error: () => {
        this.snackbar.open('Error to select card', undefined, { duration: 3000 });
      },
    });
  }

  onResetCards() {
    this.roomService.onResetCards(this.roomCode(), this.players()).subscribe({
      error: () => {
        this.snackbar.open('Error to reset cards', undefined, { duration: 3000 });
      },
    });
  }

  onReveal() {
    this.roomService.onReveal(this.roomCode(), true).subscribe({
      error: () => {
        this.snackbar.open('Error to reveal cards', undefined, { duration: 3000 });
      },
    });
  }

  onDeletePlayer(playerId: string) {
    this.roomService.onDeletePlayer(this.roomCode(), playerId).subscribe({
      error: () => {
        this.snackbar.open('Error to delete player', undefined, { duration: 3000 });
      },
    });
  }

  onClearAll() {
    this.players().forEach((player) => {
      if (this.player().id === player.id) return;
      this.onDeletePlayer(player.id);
    });
  }
}
