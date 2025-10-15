import { Component, inject, input, OnInit, signal } from '@angular/core';
import { RoomService } from './room-service';
import { JsonPipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

export interface Card {
  value: string;
  label: string;
}

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'user';
  card?: Card;
}

export function countCards(list: User[]): Record<string, number> {
  return list.reduce((acc, item) => {
    const key = String(item.card?.value);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

@Component({
  selector: 'app-room',
  imports: [JsonPipe, ReactiveFormsModule],
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
  public participants = signal<User[]>([]);
  public cardSelected: any;
  public user = this.roomService.currentUser;
  public readonly showCards = signal(false);
  public result!: Record<string, number>;
  public cardResult = signal<Card[]>([]);
  roomCode = input.required<string>();

  ngOnInit(): void {
    this.checkUser();
    this.getPlayers();
  }

  getPlayers() {
    this.roomService.getParticipants(this.roomCode()).subscribe({
      next: (qs) => {
        console.log('QS ', qs);
        this.participants.set(qs as unknown as User[]);
      },
    });
  }

  checkUser() {
    const roomStored = localStorage.getItem('pokercrum');
    if (roomStored) {
      const state = JSON.parse(roomStored);
      if (state.room === this.roomCode()) {
        this.user = signal(state.user);
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

    const user = { ...this.user(), username } as User;

    this.roomService.joinRoom(user, this.roomCode()).subscribe({
      next: (res) => {
        console.log('UserCreated ', res);
        this.user.set(user);
      },
    });
  }

  onShowCards() {
    this.showCards.set(true);
    const result = countCards(this.participants());
    const resultList: Card[] = [];
    console.log('Result = ', result);

    Object.entries(result).forEach(([key, value]) => {
      resultList.push({
        value: key,
        label: value.toString(),
      });
    });
    this.cardResult.set(resultList);
  }

  onSelectCard(card: Card) {
    this.cardSelected = card;
    const user = { ...this.user(), card } as User;
    console.log(user);
    this.roomService.selectCard(this.roomCode(), user).subscribe({
      next: (res) => {
        console.log('UserCardUpdated ', res);
      },
    });
  }

  onResetCards() {
    this.showCards.set(false);
  }
}
