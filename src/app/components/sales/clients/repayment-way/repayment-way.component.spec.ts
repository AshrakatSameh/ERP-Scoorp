import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepaymentWayComponent } from './repayment-way.component';

describe('RepaymentWayComponent', () => {
  let component: RepaymentWayComponent;
  let fixture: ComponentFixture<RepaymentWayComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RepaymentWayComponent]
    });
    fixture = TestBed.createComponent(RepaymentWayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
