import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

type DialogResult = { imei: string } | undefined;



@Component({
  selector: 'app-unassign-device-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatFormFieldModule, MatSelectModule, MatButtonModule],
  templateUrl: './unassign-device-dialog.html',
  styleUrl: './unassign-device-dialog.css'
})
export class UnassignDeviceDialogComponent {
  private readonly ref = inject(MatDialogRef<UnassignDeviceDialogComponent, DialogResult>);
  constructor(@Inject(MAT_DIALOG_DATA) public data: { imeis: string[] }) {}

  selectedImei = '';

  close() { this.ref.close(); }
  unassign() {
    if (this.selectedImei) this.ref.close({ imei: this.selectedImei });
  }
}
