import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from '@/app/core/services/auth-service';
import { PlayerStore } from '@/app/core/services/player-store';
import { RoomService } from '@/app/pages/room/room-service';

import { HomePage } from './home-page';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [
        { provide: AuthService, useValue: {} },
        {
          provide: PlayerStore,
          useValue: {
            player: signal({ id: '', username: '', fromMobile: false, isOnline: true }),
          },
        },
        { provide: RoomService, useValue: {} },
        { provide: Router, useValue: { navigate: () => Promise.resolve(true) } },
        { provide: MatSnackBar, useValue: { open: () => {} } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
