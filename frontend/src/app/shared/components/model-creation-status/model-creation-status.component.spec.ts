import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelCreationStatusComponent } from './model-creation-status.component';

describe('ModelCreationStatusComponent', () => {
  let component: ModelCreationStatusComponent;
  let fixture: ComponentFixture<ModelCreationStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModelCreationStatusComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModelCreationStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
