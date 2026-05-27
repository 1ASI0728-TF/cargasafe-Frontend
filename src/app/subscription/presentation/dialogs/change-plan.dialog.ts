import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Plan } from '../../domain/plan';

export interface ChangePlanData {
  plans: Plan[];
  currentPlanId: string | number;
}

@Component({
  standalone: true,
  selector: 'app-change-plan-dialog',
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="wrap">
      <div class="header">
        <h2>UPGRADE YOUR SUBSCRIPTION</h2>
        <button mat-icon-button class="close" (click)="close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>
      <p class="lead">
        We're glad you enjoy our app, and we're happy to hear you're interested in an upgrade.
      </p>

      <div class="grid">
        <div
          class="card"
          *ngFor="let p of data.plans"
          [class.disabled]="isCurrent(p)"
        >
          <div class="card-body">
            <div class="title">{{ p.name | uppercase }}</div>
            <div class="subtitle">
              {{ vehiclesLabel(p) }}
            </div>
            <div class="price">S/. {{ p.price }}/month</div>

            <ul class="features">
              <li>Real-time monitoring</li>
              <li>Smart alerts</li>
              <li>Centralized management</li>
            </ul>
          </div>

          <div class="card-actions">
            <button
              mat-flat-button
              color="primary"
              *ngIf="!isCurrent(p)"
              (click)="confirm(p)"
            >
              Choose plan
            </button>

            <button
              mat-stroked-button
              disabled
              *ngIf="isCurrent(p)"
            >
              Current plan
            </button>
          </div>
        </div>
      </div>
    </div>
  `,

  styles: [`
  .wrap {
    width: 100%;
    padding: 32px 40px 40px;
    background: #fff;
    border-radius: 14px;
    box-sizing: border-box;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .header h2 {
    margin: 0;
    font-weight: 800;
    font-size: 22px;
    letter-spacing: .3px;
  }

  .lead {
    margin: 4px 0 28px;
    color: #555;
    font-size: 15px;
  }

  .grid {
    display: flex;
    justify-content: center;
    align-items: stretch;
    gap: 28px;
    flex-wrap: nowrap;
  }

  .card {
    background: #fff;
    border: 1px solid #eee;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0,0,0,.08);
    width: 320px;
    height: 420px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    transition: transform .15s ease, box-shadow .15s ease;
  }

  .card:hover:not(.disabled) {
    transform: translateY(-4px);
    box-shadow: 0 8px 22px rgba(0,0,0,.12);
  }

  .card.disabled {
    opacity: .55;
    filter: grayscale(.15);
  }

  .card-body { padding: 22px; text-align: center; }
  .title { font-weight: 800; font-size: 18px; }
  .subtitle { color: #6b7280; margin-top: 4px; font-size: 14px; }
  .price { color: #F7931A; font-weight: 800; font-size: 26px; margin: 18px 0 16px; }

  .features { list-style: none; margin: 0; padding: 0; text-align: left; font-size: 14px; color: #111; }
  .features li { margin: 8px 0; position: relative; padding-left: 18px; }
  .features li::before { content: "•"; position: absolute; left: 4px; color: #F7931A; font-weight: 900; }

  .card-actions { padding: 18px 20px 24px; display: flex; justify-content: center; }
  .close { color: #333; }

`]

})
export class ChangePlanDialog {
  private ref = inject(MatDialogRef<ChangePlanDialog>);
  constructor(@Inject(MAT_DIALOG_DATA) public data: ChangePlanData) {}

  isCurrent(p: Plan) {
    return String(p.id) === String(this.data.currentPlanId);
  }

  vehiclesLabel(p: Plan) {
    if ((p as any).vehiclesLimit === 0 || (p as any).vehiclesLimit === 'unlimited') return 'Unlimited vehicles';
    if ((p as any).vehiclesLimit) return `Up to ${ (p as any).vehiclesLimit } vehicles`;
    return '';
  }

  confirm(plan: Plan) {
    this.ref.close(plan);
  }

  close() { this.ref.close(null); }
}
