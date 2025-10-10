import { Component } from '@angular/core';

@Component({
  selector: 'app-board-page',
  imports: [],
  templateUrl: './board-page.html',
  styleUrl: './board-page.css',
})
export default class BoardPage {
  cards = [
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
  cardSelected: any;
}
