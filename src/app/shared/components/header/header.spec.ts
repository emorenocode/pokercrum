import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PlayerStore } from '@/app/core/services/player-store';
import { OverlayContent } from '@/app/core/services/overlay-content';

import { Header } from './header';

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [
        {
          provide: PlayerStore,
          useValue: {
            player: signal({ id: '', username: '', fromMobile: false, isOnline: true }),
          },
        },
        { provide: OverlayContent, useValue: { open: () => {}, close: () => {} } },
        { provide: MatSnackBar, useValue: { open: () => {} } },
        { provide: Clipboard, useValue: { copy: () => true } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
