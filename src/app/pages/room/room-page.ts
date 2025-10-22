import { Component, inject, input, OnInit, signal, TemplateRef } from '@angular/core';
import { RoomService } from './room-service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface Card {
  value: string;
  label: string;
}

export interface Player {
  id: string;
  username: string;
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
  imports: [ReactiveFormsModule, RouterLink, MatIconModule, MatButtonModule, MatDialogModule],
  templateUrl: './room-page.html',
  styleUrl: './room-page.css',
})
export class RoomPage implements OnInit {
  private readonly snackbar = inject(MatSnackBar);
  private readonly clipboad = inject(Clipboard);
  private readonly roomService = inject(RoomService);
  private readonly isInitialLoad = signal(true);

  public readonly showCards = signal(false);
  public readonly cards = signal<Card[]>([
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
  public readonly players = signal<Player[]>([]);
  public readonly cardSelected = signal<Card | undefined>(undefined);
  public readonly cardResult = signal<Card[]>([]);
  public readonly dialog = inject(MatDialog);
  public readonly currentUrl = location.href;
  public readonly player = this.roomService.currentPlayer;
  public readonly roomCode = input.required<string>();
  public readonly username = new FormControl();
  public result!: Record<string, number>;
  currentRoom: any;

  ngOnInit(): void {
    this.checkUser();
    this.getPlayers();
    this.onListenerReveal();
    this.getRoom();
  }

  getRoom() {
    this.roomService.getRoom(this.roomCode()).subscribe({
      next: (doc) => {
        if (doc.exists()) {
          this.currentRoom = doc.data();
        }
      },
    });
  }

  openDialogToShared(template: TemplateRef<any>) {
    this.dialog
      .open(template)
      .afterClosed()
      .subscribe({
        next: (res) => {
          if (!res) return;

          try {
            const success = this.clipboad.copy(this.currentUrl);
            if (success) {
              this.snackbar.open('Link copied successfully', undefined, { duration: 3000 });
            }
          } catch (error) {
            console.error('Error to copy link ', error);
            this.snackbar.open('Error copying link', undefined, { duration: 3000 });
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

  checkUser() {
    const userStored = localStorage.getItem('pcUser');
    if (userStored) {
      const state = JSON.parse(userStored);
      if (state) {
        this.player.set(state);
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
          this.onShowCards();
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
