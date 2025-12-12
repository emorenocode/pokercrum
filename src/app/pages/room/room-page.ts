import {
  Component,
  computed,
  inject,
  input,
  OnChanges,
  OnDestroy,
  signal,
  SimpleChanges,
} from '@angular/core';
import { RoomService } from './room-service';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Header } from '@/app/shared/components/header/header';
import { Subject, take, takeUntil } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

interface Result {
  label: string;
  card: string;
  vote: number;
}
export interface Card {
  value: string;
  label: string;
}

export interface Player {
  id: string;
  username: string;
  card?: Card;
  room?: string;
}

export function countCards(list: Player[]): Record<string, number> {
  return list.reduce((acc, item) => {
    if (item.card?.value == null) return acc;

    const key = String(item.card?.value);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

@Component({
  selector: 'app-room',
  imports: [ReactiveFormsModule, MatButton, MatTooltipModule, Header, MatProgressSpinner],
  templateUrl: './room-page.html',
  styleUrl: './room-page.css',
})
export class RoomPage implements OnChanges, OnDestroy {
  private readonly metaTitle = inject(Title);
  private readonly onDestroy$ = new Subject<void>();
  private readonly snackbar = inject(MatSnackBar);
  private readonly roomService = inject(RoomService);
  private readonly isInitialLoad = signal(true);
  private readonly router = inject(Router);

  public readonly isLoadingRoom = signal(true);
  public readonly showCards = signal(false);
  public readonly cards = signal<Card[]>([
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
  ]);
  public readonly players = signal<Player[]>([]);
  public readonly cardSelected = signal<Card | undefined>(undefined);
  public readonly resultList = signal<Result[]>([]);
  public readonly player = this.roomService.currentPlayer;
  public readonly roomCode = input.required<string>();
  public readonly username = new FormControl(null, Validators.required);
  public readonly currentRoom = computed<any>(() => this.roomService.currentRoom());
  public result!: Record<string, number>;

  constructor() {}

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['roomCode']) {
      this.onDestroy$.next();
      this.getPlayers();
      this.onListenerReveal();
      this.getRoom();
    }
  }

  getRoom() {
    this.isLoadingRoom.set(true);
    this.roomService.getRoom(this.roomCode()).subscribe({
      next: (doc) => {
        if (doc.exists()) {
          this.roomService.currentRoom.set(doc.data());
          const roomOwner = this.players().find((player) => player.room === this.roomCode());
          this.metaTitle.setTitle(`PokerCrum Room of ${roomOwner?.username}`);
        } else {
          if (this.roomCode() !== this.player().room) {
            this.router.navigate(['/']);
            this.snackbar.open(`Room ${this.roomCode()} not found`, undefined, { duration: 3000 });
          }
        }
        this.isLoadingRoom.set(false);
      },
    });
  }

  getPlayers() {
    this.roomService
      .getPlayers(this.roomCode())
      .pipe(takeUntil(this.onDestroy$))
      .subscribe({
        next: (qs) => {
          this.players.set(qs as unknown as Player[]);
          this.players().forEach((player) => {
            if (player.id === this.player().id) {
              this.cardSelected.set(player.card);
            }
          });
        },
        error: () => {
          this.snackbar.open('Error to get players', undefined, { duration: 3000 });
        },
      });
  }

  onJoinRoom() {
    const username = this.username.value ?? '';
    if (this.username.invalid || username.trim() === '') {
      this.username.reset();
      this.username.markAllAsTouched();
      return;
    }

    const user = { ...this.player(), username } as Player;

    this.roomService.joinRoom(user, this.roomCode()).subscribe({
      next: () => {
        this.player.set(user);
      },
      error: () => {
        this.snackbar.open('Error to join room', undefined, { duration: 3000 });
      },
    });
  }

  onShowCards() {
    this.roomService
      .onReveal(this.roomCode(), true)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.showCards.set(true);
        },
        error: () => {
          this.snackbar.open('Error to show cards', undefined, { duration: 3000 });
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
    this.isInitialLoad.set(false);
  }

  onResetCards() {
    this.roomService.onResetCards(this.roomCode(), this.players()).subscribe({
      next: () => {
        this.showCards.set(false);
      },
      error: () => {
        this.snackbar.open('Error to reset cards', undefined, { duration: 3000 });
      },
    });
  }

  onListenerReveal() {
    this.roomService
      .getReveal(this.roomCode())
      .pipe(takeUntil(this.onDestroy$))
      .subscribe({
        next: (res) => {
          if (res) {
            const result = countCards(this.players());
            const resultList: Result[] = [];

            Object.entries(result).forEach(([key, value]) => {
              resultList.push({
                vote: value,
                card: key,
                label: `( ${value} vote${value > 1 ? 's' : ''} )`,
              });
            });
            this.resultList.set(resultList.sort((a, b) => a.vote - b.vote));
          } else {
            if (!this.isInitialLoad()) {
              this.cardSelected.set(undefined);
            }
          }
          this.showCards.set(res);
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
}
