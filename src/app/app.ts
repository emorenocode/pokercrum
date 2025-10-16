import { Component, inject } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly meta = inject(Meta);

  constructor() {
    this.meta.updateTag({
      name: 'decription',
      content: 'PokerCrum is a Planning Poker Game for teams using scrum methodoly',
    });
  }
}
