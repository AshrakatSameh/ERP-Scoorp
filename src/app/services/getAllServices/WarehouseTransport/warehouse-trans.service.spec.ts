import { TestBed } from '@angular/core/testing';

import { WarehouseTransService } from './warehouse-trans.service';

describe('WarehouseTransService', () => {
  let service: WarehouseTransService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WarehouseTransService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
