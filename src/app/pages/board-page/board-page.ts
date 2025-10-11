import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';

interface Card {
  value: string;
  label: string;
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
  ];
  public participants: User[] = [
    {
      id: 'asdf1',
      username: 'Luis 1',
      role: 'user',
      card: { value: '1', label: '1' },
    },
    {
      id: 'asdf2',
      username: 'Luis 2',
      role: 'user',
      card: { value: '1', label: '1' },
    },
    {
      id: 'asdf3',
      username: 'Luis 3',
      role: 'user',
      card: { value: '1', label: '1' },
    },
    {
      id: 'asdf4',
      username: 'Luis 4',
      role: 'user',
      card: { value: '3', label: '1' },
    },
    {
      id: 'asdf5',
      username: 'Luis 5',
      role: 'user',
      card: { value: '1', label: '1' },
    },
    {
      id: 'asdf6',
      username: 'Luis 6',
      role: 'user',
      card: { value: '3', label: '1' },
    },
    {
      id: 'asdf6',
      username: 'Luis 7',
      role: 'user',
      card: { value: '♾️', label: '♾️' },
    },
    {
      id: 'asdf6',
      username: 'Luis 8',
      role: 'user',
      card: { value: '☕️', label: '☕️' },
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
  public cardResult: Card[] = [];

  onShowCards() {
    this.showCards.set(true);
    const result = countCards(this.participants);
    const resultList: Card[] = [];
    console.log('Result = ', result);

    Object.entries(result).forEach(([key, value]) => {
      resultList.push({
        value: key,
        label: value.toString(),
      });
    });
    this.cardResult = resultList;
  }

  onSelectCard(card: Card) {
    this.cardSelected = card;
  }
}
