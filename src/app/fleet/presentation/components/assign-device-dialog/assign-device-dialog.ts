import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { Device } from '../../../domain/model/device.model';
import { FleetStore } from '../../../application/fleet.store';

type DialogResult = { imei: string } | undefined;

@Component({
  selector: 'app-assign-device-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatFormFieldModule, MatSelectModule, MatButtonModule],
  templateUrl: './assign-device-dialog.html',
  styleUrl: './assign-device-dialog.css'
})
export class AssignDeviceDialogComponent implements OnInit {
  private store = inject(FleetStore);
  private ref = inject(MatDialogRef<AssignDeviceDialogComponent, DialogResult>);

  constructor(@Inject(MAT_DIALOG_DATA) public data: { vehicleId: number }) {}

  devices: Device[] = [];
  selectedImei = '';

  ngOnInit(): void {
    this.store.devices$.subscribe(list => {
      this.devices = (list ?? []).filter(d => !d.vehiclePlate);
    });
    this.store.loadDevices();
  }

  close() { this.ref.close(); }
  assign() {
    if (this.selectedImei) this.ref.close({ imei: this.selectedImei });
  }
}
