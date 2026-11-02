import { TestBed } from '@angular/core/testing';
import { Auth } from '@angular/fire/auth';
import { Database } from '@angular/fire/database';
import { PlayerPresence } from './player-presence';

describe('PlayerPresence', () => {
  let service: PlayerPresence;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: Auth, useValue: {} },
        { provide: Database, useValue: {} },
      ],
    });
    service = TestBed.inject(PlayerPresence);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
