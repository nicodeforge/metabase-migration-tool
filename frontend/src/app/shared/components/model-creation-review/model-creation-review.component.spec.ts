import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelCreationReviewComponent } from './model-creation-review.component';

describe('ModelCreationReviewComponent', () => {
  let component: ModelCreationReviewComponent;
  let fixture: ComponentFixture<ModelCreationReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModelCreationReviewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModelCreationReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
