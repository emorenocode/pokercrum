import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';

interface Card {
  value: number | string;
  label: string;
  tooltip: string;
}

interface User {
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
  selector: 'app-board-page',
  imports: [JsonPipe],
  templateUrl: './board-page.html',
  styleUrl: './board-page.css',
})
export default class BoardPage {
  public cards: Card[] = [
    { value: 0, label: '0', tooltip: '' },
    { value: 0.5, label: '1/2', tooltip: 'Tarea muy pequeña' },
    { value: 1, label: '1', tooltip: 'Tarea pequeña' },
    { value: 2, label: '2', tooltip: 'Tarea pequeña' },
    { value: 3, label: '3', tooltip: 'Tarea pequeńa' },
    { value: 5, label: '5', tooltip: 'Tarea mediana' },
    { value: 8, label: '8', tooltip: 'Tarea mediana' },
    { value: 13, label: '13', tooltip: 'Tarea mediana' },
    { value: 20, label: '20', tooltip: 'Tarea grande' },
    { value: 40, label: '40', tooltip: 'Tarea grande' },
    { value: 100, label: '100', tooltip: 'Tarea muy grande' },
    { value: '?', label: '?', tooltip: 'Tarea Inestimable' },
    { value: '♾️', label: '♾️', tooltip: 'Tarea enorme' },
    { value: '☕️', label: '☕️', tooltip: 'Hora de una pause' },
  ];
  public participants: User[] = [
    {
      id: 'asdf1',
      username: 'Luis 1',
      role: 'user',
      card: { value: '1', label: '1', tooltip: '' },
    },
    {
      id: 'asdf2',
      username: 'Luis 2',
      role: 'user',
      card: { value: '1', label: '1', tooltip: '' },
    },
    {
      id: 'asdf3',
      username: 'Luis 3',
      role: 'user',
      card: { value: '1', label: '1', tooltip: '' },
    },
    {
      id: 'asdf4',
      username: 'Luis 4',
      role: 'user',
      card: { value: '1', label: '1', tooltip: '' },
    },
    {
      id: 'asdf5',
      username: 'Luis 5',
      role: 'user',
      card: { value: '1', label: '1', tooltip: '' },
    },
    {
      id: 'asdf6',
      username: 'Luis 6',
      role: 'user',
      card: { value: '1', label: '1', tooltip: '' },
    },
  ];
  public cardSelected: any;
  public user: User = {
    id: 'asdfasdf',
    username: 'Enrique',
    role: 'admin',
  };
  public readonly showCards = signal(false);
  public result!: Record<string, number>;

  onShowCards() {
    this.showCards.set(true);
    this.result = countCards(this.participants);
    console.log('Result = ', this.result);
  }

  onSelectCard(card: Card) {
    this.cardSelected = card;
  }
}
