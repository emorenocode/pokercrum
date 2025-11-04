import { TestBed } from '@angular/core/testing';

import { OverlayContent } from './overlay-content';

describe('OverlayContent', () => {
  let service: OverlayContent;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OverlayContent);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
