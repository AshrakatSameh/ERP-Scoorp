import { TestBed } from '@angular/core/testing';

import { ConvenantBoxService } from './convenant-box.service';

describe('ConvenantBoxService', () => {
  let service: ConvenantBoxService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConvenantBoxService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
