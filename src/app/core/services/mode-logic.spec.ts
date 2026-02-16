import { TestBed } from '@angular/core/testing';

import { ModeLogic } from './mode-logic';

describe('ModeLogic', () => {
  let service: ModeLogic;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ModeLogic);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
