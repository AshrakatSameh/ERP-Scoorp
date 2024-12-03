import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeOfContractsComponent } from './type-of-contracts.component';

describe('TypeOfContractsComponent', () => {
  let component: TypeOfContractsComponent;
  let fixture: ComponentFixture<TypeOfContractsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TypeOfContractsComponent]
    });
    fixture = TestBed.createComponent(TypeOfContractsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
