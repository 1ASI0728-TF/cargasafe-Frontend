import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateFirmwareDialog } from './update-firmware-dialog';

describe('UpdateFirmwareDialog', () => {
  let component: UpdateFirmwareDialog;
  let fixture: ComponentFixture<UpdateFirmwareDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateFirmwareDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateFirmwareDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
