import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkServecesSectionsComponent } from './work-serveces-sections.component';

describe('WorkServecesSectionsComponent', () => {
  let component: WorkServecesSectionsComponent;
  let fixture: ComponentFixture<WorkServecesSectionsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WorkServecesSectionsComponent]
    });
    fixture = TestBed.createComponent(WorkServecesSectionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
