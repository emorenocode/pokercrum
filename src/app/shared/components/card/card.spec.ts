import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Card } from '@/app/core/models';
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
    fixture.componentRef.setInput('card', { value: '1', label: 'One' } satisfies Card);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
