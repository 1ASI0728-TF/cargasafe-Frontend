import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnassignDeviceDialog } from './unassign-device-dialog';

describe('UnassignDeviceDialog', () => {
  let component: UnassignDeviceDialog;
  let fixture: ComponentFixture<UnassignDeviceDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnassignDeviceDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnassignDeviceDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
