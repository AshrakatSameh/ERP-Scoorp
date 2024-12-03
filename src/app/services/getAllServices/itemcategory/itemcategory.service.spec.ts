import { TestBed } from '@angular/core/testing';

import { ItemcategoryService } from './itemcategory.service';

describe('ItemcategoryService', () => {
  let service: ItemcategoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ItemcategoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
