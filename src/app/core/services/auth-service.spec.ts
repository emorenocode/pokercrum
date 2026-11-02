import { TestBed } from '@angular/core/testing';
import { Auth } from '@angular/fire/auth';
import { PlayerApi } from './player-api';
import { PlayerStore } from './player-store';
import { AuthService } from './auth-service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: Auth, useValue: {} },
        { provide: PlayerStore, useValue: {} },
        { provide: PlayerApi, useValue: {} },
      ],
    });
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
