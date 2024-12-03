import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeEmployeeRequestsComponent } from './type-employee-requests.component';

describe('TypeEmployeeRequestsComponent', () => {
  let component: TypeEmployeeRequestsComponent;
  let fixture: ComponentFixture<TypeEmployeeRequestsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TypeEmployeeRequestsComponent]
    });
    fixture = TestBed.createComponent(TypeEmployeeRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
