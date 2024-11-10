import { TestBed } from '@angular/core/testing';

import { padoService } from './padoConnect.service';

describe('BinanceService', () => {
  let service: padoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(padoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
