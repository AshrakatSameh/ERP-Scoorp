import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoxAndCommitmentComponent } from './box-and-commitment.component';

describe('BoxAndCommitmentComponent', () => {
  let component: BoxAndCommitmentComponent;
  let fixture: ComponentFixture<BoxAndCommitmentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BoxAndCommitmentComponent]
    });
    fixture = TestBed.createComponent(BoxAndCommitmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
