import { TestBed } from '@angular/core/testing';

import { ItemgroupService } from './itemgroup.service';

describe('ItemgroupService', () => {
  let service: ItemgroupService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ItemgroupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
