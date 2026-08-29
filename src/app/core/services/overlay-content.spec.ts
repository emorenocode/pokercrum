import { TestBed } from '@angular/core/testing';
import { Firestore } from '@angular/fire/firestore';

import { OverlayContent } from './overlay-content';

describe('OverlayContent', () => {
  let service: OverlayContent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: Firestore, useValue: {} }],
    });
    service = TestBed.inject(OverlayContent);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
