import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {ErrorDialogComponent, ErrorDialogData} from '../components/error-dialog/error-dialog';

@Injectable({ providedIn: 'root' })
export class ErrorDialogService {
  constructor(private dialog: MatDialog) {}

  showError(data: ErrorDialogData) {
    this.dialog.open(ErrorDialogComponent, {
      width: '420px',
      data,
      disableClose: true
    });
  }
}
