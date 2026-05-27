import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { Vehicle } from '../../../domain/model/vehicle.model';
import { FleetStore } from '../../../application/fleet.store';

@Component({
  selector: 'app-assign-vehicle-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatFormFieldModule, MatSelectModule, MatButtonModule],
  templateUrl: './assign-vehicle-dialog.html',
  styleUrl: './assign-vehicle-dialog.css',
})
export class AssignVehicleDialogComponent {
  private store = inject(FleetStore);
  private ref = inject(MatDialogRef<AssignVehicleDialogComponent, number>);

  vehicles: Vehicle[] = [];
  selectedId?: number;

  constructor() {
    this.store.vehicles$.subscribe(v => (this.vehicles = v));
    this.store.loadVehicles();
  }

  close() { this.ref.close(); }
  ok() { this.ref.close(this.selectedId); }
}
