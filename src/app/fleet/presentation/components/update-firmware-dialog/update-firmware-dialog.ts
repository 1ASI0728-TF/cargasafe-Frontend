import {Component, Inject} from '@angular/core';


import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'app-update-firmware-dialog',
  imports: [CommonModule, FormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './update-firmware-dialog.html',
  styleUrl: './update-firmware-dialog.css',
  standalone: true,
})

export class FirmwareDialogComponent {
  value: string;

  constructor(
    private ref: MatDialogRef<FirmwareDialogComponent, string>,
    @Inject(MAT_DIALOG_DATA) public data: { current: string }
  ) {
    this.value = data?.current ?? 'v1.0.0';
  }

  close() { this.ref.close(); }
  ok(){
    const v = this.value?.trim();
    if (!v) return;
    this.ref.close(v);
  }
}
