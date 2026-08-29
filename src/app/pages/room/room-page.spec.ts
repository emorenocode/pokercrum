import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Firestore } from '@angular/fire/firestore';

import { RoomPage } from './room-page';

describe('RoomPage', () => {
  let component: RoomPage;
  let fixture: ComponentFixture<RoomPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomPage],
      providers: [{ provide: Firestore, useValue: {} }],
    }).compileComponents();

    fixture = TestBed.createComponent(RoomPage);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('roomCode', 'test-room');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
