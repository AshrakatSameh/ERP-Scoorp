import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BranchesAndLocationsComponent } from './branches-and-locations.component';

describe('BranchesAndLocationsComponent', () => {
  let component: BranchesAndLocationsComponent;
  let fixture: ComponentFixture<BranchesAndLocationsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BranchesAndLocationsComponent]
    });
    fixture = TestBed.createComponent(BranchesAndLocationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
