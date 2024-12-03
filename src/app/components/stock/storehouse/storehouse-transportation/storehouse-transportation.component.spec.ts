import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StorehouseTransportationComponent } from './storehouse-transportation.component';

describe('StorehouseTransportationComponent', () => {
  let component: StorehouseTransportationComponent;
  let fixture: ComponentFixture<StorehouseTransportationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StorehouseTransportationComponent]
    });
    fixture = TestBed.createComponent(StorehouseTransportationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
