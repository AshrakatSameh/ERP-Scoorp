import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StorehouseComponent } from './storehouse.component';

describe('StorehouseComponent', () => {
  let component: StorehouseComponent;
  let fixture: ComponentFixture<StorehouseComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StorehouseComponent]
    });
    fixture = TestBed.createComponent(StorehouseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
