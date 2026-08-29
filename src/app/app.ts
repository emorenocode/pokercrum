import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './app.css',
})
export class App {
  private readonly meta = inject(Meta);

  constructor() {
    this.meta.updateTag({
      name: 'description',
      content: 'PokerCrum is a Planning Poker Game for teams using scrum methodology',
    });
  }
}
