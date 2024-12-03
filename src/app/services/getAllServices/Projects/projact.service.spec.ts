import { TestBed } from '@angular/core/testing';

import { ProjactService } from './projact.service';

describe('ProjactService', () => {
  let service: ProjactService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProjactService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
