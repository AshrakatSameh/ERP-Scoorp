import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepaymentPeriodComponent } from './repayment-period.component';

describe('RepaymentPeriodComponent', () => {
  let component: RepaymentPeriodComponent;
  let fixture: ComponentFixture<RepaymentPeriodComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RepaymentPeriodComponent]
    });
    fixture = TestBed.createComponent(RepaymentPeriodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
