import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-change-card-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  template: `
  <section class="change-card">
    <div class="header">
      <button mat-stroked-button (click)="goBack()">
        ← Back to subscriptions
      </button>
      <h1>Link payment method</h1>
      <span class="spacer"></span>
    </div>

    <!-- SIMULACIÓN (UI) -->
    <mat-card class="form">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="row">
          <mat-form-field appearance="outline" class="grow">
            <mat-label>Card number</mat-label>
            <input matInput formControlName="number" placeholder="1234 1234 1234 1234" />
          </mat-form-field>
          <img class="brands" alt="brands"
               src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg">
        </div>

        <div class="row">
          <mat-form-field appearance="outline">
            <mat-label>Expiry</mat-label>
            <input matInput formControlName="exp" placeholder="MM/YY" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>CVC</mat-label>
            <input matInput formControlName="cvc" placeholder="CVC" />
          </mat-form-field>
        </div>

        <div class="row">
          <mat-form-field appearance="outline">
            <mat-label>Country</mat-label>
            <mat-select formControlName="country">
              <mat-option value="PE">Peru</mat-option>
              <mat-option value="US">United States</mat-option>
              <mat-option value="CL">Chile</mat-option>
              <mat-option value="MX">Mexico</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Postal code</mat-label>
            <input matInput formControlName="postal" placeholder="00000" />
          </mat-form-field>
        </div>

        <button mat-flat-button color="primary" class="cta" [disabled]="form.invalid">
          Confirm
        </button>
      </form>
    </mat-card>
  </section>
  `,
  styles: [`
    .change-card { padding: 16px 24px; }
    .header { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 12px; margin-bottom: 16px; }
    .header h1 { margin: 0; text-align: center; font-weight: 800; }
    .spacer { width: 120px; }

    .form { max-width: 720px; padding: 20px; }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; align-items: center; }
    .row + .row { margin-top: 12px; }
    .grow { grid-column: 1 / -1; }
    .brands { height: 28px; justify-self: end; opacity: .9; }

    .cta { margin-top: 16px; width: 100%; background: #F7931A; color: #111; }
    @media (max-width: 800px){
      .row { grid-template-columns: 1fr; }
      .brands { display: none; }
    }
  `]
})
export class ChangeCardPage {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private snack = inject(MatSnackBar);

  form = this.fb.group({
    number: ['', [Validators.required, Validators.pattern(/^(\d{4}\s?){4}$/)]],
    exp: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
    cvc: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
    country: ['PE', Validators.required],
    postal: ['', Validators.required],
  });

  goBack(){ this.router.navigate(['/subscriptions']); }

  onSubmit(){
    if(this.form.invalid) return;
    // 🧪 Simulación: feedback y regresar
    this.snack.open('Payment method linked (simulation)', 'Close', { duration: 2000 });
    this.router.navigate(['/subscriptions']);
  }
}
