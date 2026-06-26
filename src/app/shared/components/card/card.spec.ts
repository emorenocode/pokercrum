import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UICard } from './card';

describe('UICard', () => {
  let component: UICard;
  let fixture: ComponentFixture<UICard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UICard],
    }).compileComponents();

    fixture = TestBed.createComponent(UICard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
