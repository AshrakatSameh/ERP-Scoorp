import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkServecesReqsComponent } from './work-serveces-reqs.component';

describe('WorkServecesReqsComponent', () => {
  let component: WorkServecesReqsComponent;
  let fixture: ComponentFixture<WorkServecesReqsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WorkServecesReqsComponent]
    });
    fixture = TestBed.createComponent(WorkServecesReqsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
