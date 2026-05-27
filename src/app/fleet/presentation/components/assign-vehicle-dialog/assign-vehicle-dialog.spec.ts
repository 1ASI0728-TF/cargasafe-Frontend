import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignVehicleDialog } from './assign-vehicle-dialog';

describe('AssignVehicleDialog', () => {
  let component: AssignVehicleDialog;
  let fixture: ComponentFixture<AssignVehicleDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignVehicleDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignVehicleDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
