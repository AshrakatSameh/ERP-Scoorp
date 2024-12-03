import { TestBed } from '@angular/core/testing';

import { PaymentPeriodsService } from './payment-periods.service';

describe('PaymentPeriodsService', () => {
  let service: PaymentPeriodsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaymentPeriodsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
