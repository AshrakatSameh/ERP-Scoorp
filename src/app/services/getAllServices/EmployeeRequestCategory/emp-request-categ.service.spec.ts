import { TestBed } from '@angular/core/testing';

import { EmpRequestCategService } from './emp-request-categ.service';

describe('EmpRequestCategService', () => {
  let service: EmpRequestCategService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmpRequestCategService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
