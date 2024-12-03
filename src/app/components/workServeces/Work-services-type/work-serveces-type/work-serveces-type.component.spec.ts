import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkServecesTypeComponent } from './work-serveces-type.component';

describe('WorkServecesTypeComponent', () => {
  let component: WorkServecesTypeComponent;
  let fixture: ComponentFixture<WorkServecesTypeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WorkServecesTypeComponent]
    });
    fixture = TestBed.createComponent(WorkServecesTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
