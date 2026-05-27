import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmRetireVehicleDialog } from './confirm-retire-vehicle-dialog';

describe('ConfirmRetireVehicleDialog', () => {
  let component: ConfirmRetireVehicleDialog;
  let fixture: ComponentFixture<ConfirmRetireVehicleDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmRetireVehicleDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmRetireVehicleDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
