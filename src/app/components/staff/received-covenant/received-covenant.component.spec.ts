import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceivedCovenantComponent } from './received-covenant.component';

describe('ReceivedCovenantComponent', () => {
  let component: ReceivedCovenantComponent;
  let fixture: ComponentFixture<ReceivedCovenantComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReceivedCovenantComponent]
    });
    fixture = TestBed.createComponent(ReceivedCovenantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
