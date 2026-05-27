import { Component, EventEmitter, Inject, Input, Output, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { defaultDevice, Device } from '../../../domain/model/device.model';

export type DeviceDialogData = { editMode: boolean; data: Device };

@Component({
  selector: 'app-device-create-and-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatCheckboxModule, MatButtonModule],
  templateUrl: './device-create-and-edit.component.html',
  styleUrl: './device-create-and-edit.component.css'
})
export class DeviceCreateAndEditComponent {
  @Input() editMode = false;
  @Input() data: Device = { ...defaultDevice };
  @Output() cancelRequested = new EventEmitter<void>();
  @Output() addRequested = new EventEmitter<Device>();
  @Output() updateRequested = new EventEmitter<Device>();

  constructor(
    @Optional() private dialogRef?: MatDialogRef<DeviceCreateAndEditComponent, {action:'add'|'update'|'cancel'; payload?:Device}>,
    @Optional() @Inject(MAT_DIALOG_DATA) dialogData?: DeviceDialogData
  ){
    if (dialogData) {
      this.editMode = dialogData.editMode;
      this.data = { ...dialogData.data };
    }
  }

  onCancel() {
    if (this.dialogRef) this.dialogRef.close({ action: 'cancel' });
    else this.cancelRequested.emit();
  }

  submit() {
    if (this.editMode) {
      const payload = { ...this.data };
      this.dialogRef ? this.dialogRef.close({ action: 'update', payload }) : this.updateRequested.emit(payload);
    } else {
      const payload = { ...this.data, vehiclePlate: null };
      this.dialogRef ? this.dialogRef.close({ action: 'add', payload }) : this.addRequested.emit(payload);
    }
  }
}
