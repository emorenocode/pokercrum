import { TestBed } from '@angular/core/testing';

import { PlayerApi } from './player-api';
import { PlayerStore } from './player-store';

describe('PlayerStore', () => {
  let service: PlayerStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: PlayerApi, useValue: {} }],
    });
    service = TestBed.inject(PlayerStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
