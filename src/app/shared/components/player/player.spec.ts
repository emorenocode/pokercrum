import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';

import { Player } from '@/app/core/models';
import { PlayerStore } from '@/app/core/services/player-store';
import { UIPlayer } from './player';

describe('UIPlayer', () => {
  let component: UIPlayer;
  let fixture: ComponentFixture<UIPlayer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UIPlayer],
      providers: [
        {
          provide: PlayerStore,
          useValue: {
            player: signal({ id: '', username: '', fromMobile: false, isOnline: true }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UIPlayer);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('player', {
      id: 'player-id',
      username: 'Player',
      fromMobile: false,
      isOnline: true,
    } satisfies Player);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
