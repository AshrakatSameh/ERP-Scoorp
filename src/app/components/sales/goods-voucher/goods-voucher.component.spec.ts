import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoodsVoucherComponent } from './goods-voucher.component';

describe('GoodsVoucherComponent', () => {
  let component: GoodsVoucherComponent;
  let fixture: ComponentFixture<GoodsVoucherComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GoodsVoucherComponent]
    });
    fixture = TestBed.createComponent(GoodsVoucherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
