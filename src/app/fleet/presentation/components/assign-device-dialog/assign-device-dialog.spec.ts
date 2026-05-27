import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignDeviceDialog } from './assign-device-dialog';

describe('AssignDeviceDialog', () => {
  let component: AssignDeviceDialog;
  let fixture: ComponentFixture<AssignDeviceDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignDeviceDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignDeviceDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
