import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Firestore } from '@angular/fire/firestore';

import { RoomSettings } from './room-settings';

describe('RoomSettings', () => {
  let component: RoomSettings;
  let fixture: ComponentFixture<RoomSettings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomSettings],
      providers: [{ provide: Firestore, useValue: {} }],
    }).compileComponents();

    fixture = TestBed.createComponent(RoomSettings);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
