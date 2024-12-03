import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryGroupComponent } from './category-group.component';

describe('CategoryGroupComponent', () => {
  let component: CategoryGroupComponent;
  let fixture: ComponentFixture<CategoryGroupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CategoryGroupComponent]
    });
    fixture = TestBed.createComponent(CategoryGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
