import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkeletonHeaderAdminComponent } from './skeleton-header-admin.component';

describe('SkeletonHeaderAdminComponent', () => {
  let component: SkeletonHeaderAdminComponent;
  let fixture: ComponentFixture<SkeletonHeaderAdminComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SkeletonHeaderAdminComponent]
    });
    fixture = TestBed.createComponent(SkeletonHeaderAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
