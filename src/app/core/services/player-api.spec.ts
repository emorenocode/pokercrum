import { TestBed } from '@angular/core/testing';
import { Firestore } from '@angular/fire/firestore';
import { PlayerApi } from './player-api';

describe('PlayerApi', () => {
  let service: PlayerApi;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: Firestore, useValue: {} }],
    });
    service = TestBed.inject(PlayerApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
