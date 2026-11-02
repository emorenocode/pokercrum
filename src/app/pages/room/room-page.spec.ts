import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '@/app/core/services/auth-service';
import { PlayerPresence } from '@/app/core/services/player-presence';
import { PlayerStore } from '@/app/core/services/player-store';
import { Logger } from '@/app/core/services/logger';
import { RoomService } from './room-service';

import { RoomPage } from './room-page';

describe('RoomPage', () => {
  let component: RoomPage;
  let fixture: ComponentFixture<RoomPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomPage],
      providers: [
        {
          provide: RoomService,
          useValue: {
            currentRoom: signal(undefined),
            getPlayers: () => of([]),
            onListenerRoom: () => of({ timerEnd: 0, show: false, autoRevealCards: false }),
          },
        },
        {
          provide: PlayerStore,
          useValue: {
            player: signal({ id: '', username: '', fromMobile: false, isOnline: true }),
          },
        },
        {
          provide: PlayerPresence,
          useValue: {
            status$: of('offline'),
            start: async () => {},
            stop: async () => {},
            watchOnlineUsers: () => of([]),
          },
        },
        { provide: AuthService, useValue: {} },
        { provide: Router, useValue: { navigate: () => Promise.resolve(true) } },
        { provide: MatSnackBar, useValue: { open: () => {} } },
        { provide: Title, useValue: { setTitle: () => {} } },
        { provide: Logger, useValue: { debug: () => {}, info: () => {}, warn: () => {}, error: () => {} } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RoomPage);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('roomCode', 'test-room');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
