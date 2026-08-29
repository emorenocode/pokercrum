import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Player } from '@/app/core/models';
import { UIPlayer } from './player';

describe('UIPlayer', () => {
  let component: UIPlayer;
  let fixture: ComponentFixture<UIPlayer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UIPlayer],
    }).compileComponents();

    fixture = TestBed.createComponent(UIPlayer);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('player', {
      id: 'player-id',
      username: 'Player',
      fromMobile: false,
    } satisfies Player);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
