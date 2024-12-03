import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeOfProjectsComponent } from './type-of-projects.component';

describe('TypeOfProjectsComponent', () => {
  let component: TypeOfProjectsComponent;
  let fixture: ComponentFixture<TypeOfProjectsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TypeOfProjectsComponent]
    });
    fixture = TestBed.createComponent(TypeOfProjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
