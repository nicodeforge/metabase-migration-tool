import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelDefinitionComponent } from './model-definition.component';

describe('ModelDefinitionComponent', () => {
  let component: ModelDefinitionComponent;
  let fixture: ComponentFixture<ModelDefinitionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModelDefinitionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModelDefinitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
