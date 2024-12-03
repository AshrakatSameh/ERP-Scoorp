import { TestBed } from '@angular/core/testing';

import { StoresSectionService } from './stores-section.service';

describe('StoresSectionService', () => {
  let service: StoresSectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StoresSectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
