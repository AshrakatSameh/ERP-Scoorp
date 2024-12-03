import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryEmployeeRequestsComponent } from './category-employee-requests.component';

describe('CategoryEmployeeRequestsComponent', () => {
  let component: CategoryEmployeeRequestsComponent;
  let fixture: ComponentFixture<CategoryEmployeeRequestsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CategoryEmployeeRequestsComponent]
    });
    fixture = TestBed.createComponent(CategoryEmployeeRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
