import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  standalone: true,
  selector: 'app-cancel-subscription-dialog',
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <h2>Are you sure you want to cancel your subscription?</h2>
      </div>

      <div class="dialog-actions">
        <button mat-icon-button class="ok" (click)="close(true)" aria-label="Confirm">
          <mat-icon>check_circle</mat-icon>
        </button>

        <button mat-icon-button class="ko" (click)="close(false)" aria-label="Cancel">
          <mat-icon>cancel</mat-icon>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .dialog-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      background: #fff;
      border-radius: 12px;
      overflow: hidden;
      padding: 0;
    }

    .dialog-header {
      background: #F7931A; 
      width: 100%;
      text-align: center;
      padding: 16px 24px;
    }

    .dialog-header h2 {
      margin: 0;
      color: #222;
      font-weight: 700;
      font-size: 18px;
      line-height: 1.3;
    }

    .dialog-actions {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 80px;
      width: 100%;
      padding: 40px 0 44px;
    }

    .ok mat-icon,
    .ko mat-icon {
      font-size: 82px;
      width: 82px;
      height: 82px;
    }

    .ok mat-icon { color: #16a34a; }
    .ko mat-icon { color: #111827; }


    html, body { overflow: hidden; }
  `]

})

export class CancelSubscriptionDialog {
  private ref = inject(MatDialogRef<CancelSubscriptionDialog>);
  close(result: boolean){ this.ref.close(result); }
}
