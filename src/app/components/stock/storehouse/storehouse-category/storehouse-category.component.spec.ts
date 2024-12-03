import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StorehouseCategoryComponent } from './storehouse-category.component';

describe('StorehouseCategoryComponent', () => {
  let component: StorehouseCategoryComponent;
  let fixture: ComponentFixture<StorehouseCategoryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StorehouseCategoryComponent]
    });
    fixture = TestBed.createComponent(StorehouseCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
