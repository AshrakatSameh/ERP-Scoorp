import { TestBed } from '@angular/core/testing';

import { ServiceDepartmentService } from './service-department.service';

describe('ServiceDepartmentService', () => {
  let service: ServiceDepartmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServiceDepartmentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
