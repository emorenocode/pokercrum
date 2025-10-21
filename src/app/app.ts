import { Component, inject } from '@angular/core';
import { AppCheck, getToken } from '@angular/fire/app-check';
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
  private appCheck = inject(AppCheck);

  constructor() {
    this.meta.updateTag({
      name: 'decription',
      content: 'PokerCrum is a Planning Poker Game for teams using scrum methodology',
    });

    getToken(this.appCheck, true)
      .then((t) => console.log('✅ AppCheck Token:', t.token))
      .catch((err) => console.error('❌ Error al obtener token:', err));
  }
}
