import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Firestore } from '@angular/fire/firestore';

import { TimerField } from './timer-field';

describe('TimerField', () => {
  let component: TimerField;
  let fixture: ComponentFixture<TimerField>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimerField],
      providers: [{ provide: Firestore, useValue: {} }],
    }).compileComponents();

    fixture = TestBed.createComponent(TimerField);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
