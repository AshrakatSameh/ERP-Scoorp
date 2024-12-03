import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReturnInvoicesComponent } from './return-invoices.component';

describe('ReturnInvoicesComponent', () => {
  let component: ReturnInvoicesComponent;
  let fixture: ComponentFixture<ReturnInvoicesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReturnInvoicesComponent]
    });
    fixture = TestBed.createComponent(ReturnInvoicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
