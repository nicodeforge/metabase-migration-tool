import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DuplicateCardAcrossInstanceComponent } from './duplicate-card-across-instance.component';

describe('DuplicateCardAcrossInstanceComponent', () => {
  let component: DuplicateCardAcrossInstanceComponent;
  let fixture: ComponentFixture<DuplicateCardAcrossInstanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DuplicateCardAcrossInstanceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DuplicateCardAcrossInstanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
