import { Component, EventEmitter, Inject, Input, Output, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule, MatChipSelectionChange } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { defaultVehicle, Vehicle } from '../../../domain/model/vehicle.model';

export type VehicleDialogData = { editMode: boolean; data: Vehicle };

@Component({
  selector: 'app-vehicle-create-and-edit',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatButtonModule,
  ],
  templateUrl: './vehicle-create-and-edit.html',
  styleUrl: './vehicle-create-and-edit.css',
})
export class VehicleCreateAndEditComponent {
  @Input() editMode = false;
  @Input() data: Vehicle = { ...defaultVehicle };
  @Output() cancelRequested = new EventEmitter<void>();
  @Output() addRequested = new EventEmitter<Vehicle>();
  @Output() updateRequested = new EventEmitter<Vehicle>();

  imeisText = '';

  constructor(
    @Optional()
    private dialogRef?: MatDialogRef<
      VehicleCreateAndEditComponent,
      { action: 'add' | 'update' | 'cancel'; payload?: Vehicle }
    >,
    @Optional() @Inject(MAT_DIALOG_DATA) dialogData?: VehicleDialogData
  ) {
    if (dialogData) {
      this.editMode = dialogData.editMode;
      this.data = { ...dialogData.data };
    }
    this.imeisText = (this.data.deviceImeis ?? []).join(', ');
  }

  vehicleTypes: string[] = ['TRUCK', 'VAN', 'CAR', 'MOTORCYCLE'];
  statuses: string[] = ['IN_SERVICE', 'OUT_OF_SERVICE', 'MAINTENANCE', 'RETIRED'];
  caps: string[] = ['REFRIGERATED', 'BOX', 'GPS_ONLY', 'HEAVY_LOAD', 'FRAGILE_CARGO'];

  private parseImeis() {
    const parts = (this.imeisText ?? '')
      .split(/[,\s]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    this.data.deviceImeis = parts;
  }

  onCancel() {
    if (this.dialogRef) this.dialogRef.close({ action: 'cancel' });
    else this.cancelRequested.emit();
  }

  submit() {
    this.parseImeis();
    if (this.editMode) {
      if (this.dialogRef) this.dialogRef.close({ action: 'update', payload: this.data });
      else this.updateRequested.emit(this.data);
    } else {
      if (this.dialogRef) this.dialogRef.close({ action: 'add', payload: this.data });
      else this.addRequested.emit(this.data);
    }
  }

  isSelected(cap: string): boolean {
    const list = this.data.capabilities;
    return Array.isArray(list) ? list.includes(cap) : false;
  }

  onChipSelectionChange(cap: string, ev: MatChipSelectionChange) {
    const list = Array.isArray(this.data.capabilities) ? [...this.data.capabilities] : [];
    this.data.capabilities = ev.selected
      ? list.includes(cap)
        ? list
        : [...list, cap]
      : list.filter((x) => x !== cap);
  }
}
