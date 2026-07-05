import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../application/auth.service.';
import { resetDb } from '../../../../core/fake-backend/fake-db';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    MatInputModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatButtonModule,
    MatSnackBarModule,
    MatIconModule,
  ],
  templateUrl: './login-page.html',
  styleUrls: ['./login-page.css'],
})
export class LoginPageComponent {
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  email = '';
  password = '';
  rememberMe = false;
  showPassword = false;
  isLoading = false;

  // Demo/testing build: this app runs entirely on a fake, in-browser API
  // (see src/app/core/fake-backend). These are the two seeded demo accounts,
  // one per user type, shown here so testers don't need to sign up first.
  readonly demoAccounts = [
    { label: 'Operator demo', email: 'operador@cargasafe.com', password: 'operator123' },
    { label: 'Client demo', email: 'cliente@cargasafe.com', password: 'client123' },
  ];

  isFormValid(): boolean {
    return !!this.email && !!this.password;
  }

  onSubmit(): void {
    if (!this.isFormValid() || this.isLoading) return;

    this.isLoading = true;
    this.cdr.detectChanges();

    this.authService
      .signIn(this.email, this.password)
      .subscribe({
        next: () => {
          this.snackBar.open('Login successful!', undefined, {
            duration: 1500,
            horizontalPosition: 'right',
            verticalPosition: 'top',
          });
          this.router.navigate(['/dashboard']);
        },
        error: () => {
          this.snackBar.open('Invalid credentials', undefined, {
            duration: 2000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
          });
        },
      })
      .add(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onForgotPassword(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/password-recovery']);
  }

  onSignUp(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/register']);
  }

  /** Quick-fills the form with one of the seeded demo accounts. */
  fillDemoAccount(account: { email: string; password: string }): void {
    this.email = account.email;
    this.password = account.password;
    this.cdr.detectChanges();
  }

  /** Wipes the fake, in-browser database and reseeds it with the original demo data. */
  onResetDemoData(event: Event): void {
    event.preventDefault();
    resetDb();
    this.snackBar.open('Demo data has been reset.', undefined, {
      duration: 2000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }
}
