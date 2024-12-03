import { TestBed } from '@angular/core/testing';

import { ConvenantService } from './convenant.service';

describe('ConvenantService', () => {
  let service: ConvenantService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConvenantService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
