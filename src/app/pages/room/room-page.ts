import { Component, inject, input, OnInit, signal } from '@angular/core';
import { RoomService } from './room-service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

export interface Card {
  value: string;
  label: string;
}

export interface Player {
  id: string;
  username: string;
  role: 'admin' | 'user';
  card?: Card;
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
  imports: [ReactiveFormsModule],
  templateUrl: './room-page.html',
  styleUrl: './room-page.css',
})
export class RoomPage implements OnInit {
  username = new FormControl();
  private readonly roomService = inject(RoomService);
  public cards = signal<Card[]>([
    { value: '0', label: '' },
    { value: '1/2', label: 'Tarea muy pequeña' },
    { value: '1', label: 'Tarea pequeña' },
    { value: '2', label: 'Tarea pequeña' },
    { value: '3', label: 'Tarea pequeńa' },
    { value: '5', label: 'Tarea mediana' },
    { value: '8', label: 'Tarea mediana' },
    { value: '13', label: 'Tarea mediana' },
    { value: '20', label: 'Tarea grande' },
    { value: '40', label: 'Tarea grande' },
    { value: '100', label: 'Tarea muy grande' },
    { value: '?', label: 'Tarea Inestimable' },
    { value: '♾️', label: 'Tarea enorme' },
    { value: '☕️', label: 'Hora de una pause' },
  ]);
  public participants = signal<Player[]>([]);
  public cardSelected: any;
  public player = this.roomService.currentPlayer;
  public readonly showCards = signal(false);
  public result!: Record<string, number>;
  public cardResult = signal<Card[]>([]);
  roomCode = input.required<string>();

  ngOnInit(): void {
    this.checkUser();
    this.getPlayers();
    this.onListenerReveal();
  }

  getPlayers() {
    this.roomService.getParticipants(this.roomCode()).subscribe({
      next: (qs) => {
        this.participants.set(qs as unknown as Player[]);
      },
    });
  }

  checkUser() {
    const roomStored = localStorage.getItem('pokercrum');
    if (roomStored) {
      const state = JSON.parse(roomStored);
      if (state.room === this.roomCode() && state.player) {
        this.player.set(state.player);
      }
    }
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
      next: (res) => {
        console.log('UserCreated ', res);
        this.player.set(user);
      },
    });
  }

  onShowCards() {
    const result = countCards(this.participants());
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
    });
  }

  onSelectCard(card: Card) {
    this.cardSelected = card;
    const user = { ...this.player(), card } as Player;
    this.roomService.selectCard(this.roomCode(), user).subscribe();
  }

  onResetCards() {
    this.roomService.onResetCards(this.roomCode(), this.participants()).subscribe({
      next: () => {
        this.showCards.set(false);
      },
    });
  }

  onListenerReveal() {
    this.roomService.getReveal(this.roomCode()).subscribe({
      next: (res) => {
        if (res) {
          this.onShowCards();
        } else {
          this.cardSelected = undefined;
        }
        this.showCards.set(res);
      },
    });
  }

  onDeletePlayer(playerId: string) {
    this.roomService.onDeletePlayer(this.roomCode(), playerId).subscribe();
  }
}
