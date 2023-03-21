import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CopyDashboardAcrossInstanceComponent } from './copy-dashboard-across-instance.component';

describe('CopyDashboardAcrossInstanceComponent', () => {
  let component: CopyDashboardAcrossInstanceComponent;
  let fixture: ComponentFixture<CopyDashboardAcrossInstanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CopyDashboardAcrossInstanceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CopyDashboardAcrossInstanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
