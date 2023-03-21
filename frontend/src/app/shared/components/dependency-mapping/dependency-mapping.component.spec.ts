import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DependencyMappingComponent } from './dependency-mapping.component';

describe('DependencyMappingComponent', () => {
  let component: DependencyMappingComponent;
  let fixture: ComponentFixture<DependencyMappingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DependencyMappingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DependencyMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
