import { TestBed } from '@angular/core/testing';

import { EmpRequestsService } from './emp-requests.service';

describe('EmpRequestsService', () => {
  let service: EmpRequestsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmpRequestsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
