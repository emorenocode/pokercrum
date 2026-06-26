import { ComponentFixture, TestBed } from '@angular/core/testing';

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
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
