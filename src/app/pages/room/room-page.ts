import {
  Component,
  computed,
  inject,
  input,
  OnChanges,
  signal,
  SimpleChanges,
} from '@angular/core';
import { RoomService } from './room-service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Header } from '../../shared/components/header/header';

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
  imports: [ReactiveFormsModule, MatButton, MatTooltipModule, Header],
  templateUrl: './room-page.html',
  styleUrl: './room-page.css',
})
export class RoomPage implements OnChanges {
  private readonly snackbar = inject(MatSnackBar);
  private readonly roomService = inject(RoomService);
  private readonly isInitialLoad = signal(true);

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
  public readonly cardResult = signal<Card[]>([]);
  public readonly player = this.roomService.currentPlayer;
  public readonly roomCode = input.required<string>();
  public readonly username = new FormControl();
  public result!: Record<string, number>;
  public readonly currentRoom = computed<any>(() => this.roomService.currentRoom());

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['roomCode']) {
      this.getPlayers();
      this.onListenerReveal();
      this.getRoom();
    }
  }

  getRoom() {
    this.roomService.getRoom(this.roomCode()).subscribe({
      next: (doc) => {
        if (doc.exists()) {
          this.roomService.currentRoom.set(doc.data());
        }
      },
    });
  }

  getPlayers() {
    this.roomService.getPlayers(this.roomCode()).subscribe({
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
    const result = countCards(this.players());
    const resultList: Card[] = [];

    Object.entries(result).forEach(([key, value]) => {
      resultList.push({
        value: key,
        label: value.toString(),
      });
    });
    this.cardResult.set(resultList);
    this.roomService.onReveal(this.roomCode(), true).subscribe({
      next: () => {
        this.showCards.set(true);
      },
      error: () => {
        this.snackbar.open('Error to show cards', undefined, { duration: 3000 });
      },
    });
  }

  onSelectCard(card: Card) {
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
    this.roomService.getReveal(this.roomCode()).subscribe({
      next: (res) => {
        if (res) {
          const result = countCards(this.players());
          const resultList: Card[] = [];

          Object.entries(result).forEach(([key, value]) => {
            resultList.push({
              value: key,
              label: value.toString(),
            });
          });
          this.cardResult.set(resultList);
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
