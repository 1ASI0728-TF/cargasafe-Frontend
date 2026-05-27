import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface ConfirmRetireVehicleData {
  plate: string;
}

@Component({
  selector: 'app-confirm-retire-vehicle-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './confirm-retire-vehicle-dialog.html',
  styleUrls: ['./confirm-retire-vehicle-dialog.css'],
})
export class ConfirmRetireVehicleDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ConfirmRetireVehicleData,
    private dialogRef: MatDialogRef<ConfirmRetireVehicleDialogComponent>
  ) {}

  cancel(): void {
    this.dialogRef.close(false);
  }

  confirm(): void {
    this.dialogRef.close(true);
  }
}
