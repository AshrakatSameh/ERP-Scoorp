import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceiveVoucherComponent } from './receive-voucher.component';

describe('ReceiveVoucherComponent', () => {
  let component: ReceiveVoucherComponent;
  let fixture: ComponentFixture<ReceiveVoucherComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReceiveVoucherComponent]
    });
    fixture = TestBed.createComponent(ReceiveVoucherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
