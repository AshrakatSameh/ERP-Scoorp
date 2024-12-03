import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkServecesCategoryComponent } from './work-serveces-category.component';

describe('WorkServecesCategoryComponent', () => {
  let component: WorkServecesCategoryComponent;
  let fixture: ComponentFixture<WorkServecesCategoryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WorkServecesCategoryComponent]
    });
    fixture = TestBed.createComponent(WorkServecesCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
