import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnitCategoryComponent } from './unit-category.component';

describe('UnitCategoryComponent', () => {
  let component: UnitCategoryComponent;
  let fixture: ComponentFixture<UnitCategoryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UnitCategoryComponent]
    });
    fixture = TestBed.createComponent(UnitCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
