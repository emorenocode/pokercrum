import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimerField } from './timer-field';

describe('TimerField', () => {
  let component: TimerField;
  let fixture: ComponentFixture<TimerField>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimerField]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimerField);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
