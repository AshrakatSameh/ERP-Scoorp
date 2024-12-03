import { TestBed } from '@angular/core/testing';

import { EmpRequestTypeService } from './emp-request-type.service';

describe('EmpRequestTypeService', () => {
  let service: EmpRequestTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmpRequestTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
