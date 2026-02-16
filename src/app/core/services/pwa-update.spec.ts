import { TestBed } from '@angular/core/testing';

import { PwaUpdate } from './pwa-update';

describe('PwaUpdate', () => {
  let service: PwaUpdate;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PwaUpdate);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
