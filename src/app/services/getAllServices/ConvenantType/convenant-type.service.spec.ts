import { TestBed } from '@angular/core/testing';

import { ConvenantTypeService } from './convenant-type.service';

describe('ConvenantTypeService', () => {
  let service: ConvenantTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConvenantTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
