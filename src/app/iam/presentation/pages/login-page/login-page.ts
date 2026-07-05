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
import { LongPressDirective } from '../../../../shared/presentation/directives/long-press.directive';

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
    LongPressDirective,
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

  /** 0..1 fill progress of the hidden "hold logo to reset" gesture, for the visual ring feedback. */
  resetProgress = 0;
  isResetting = false;

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

  /** Visual feedback (0..1) while the logo is being held down. */
  onResetProgress(progress: number): void {
    this.resetProgress = progress;
    this.cdr.detectChanges();
  }

  /**
   * Hidden trick: holding the CargaSafe logo for 3 seconds wipes the
   * fake, in-browser database and reseeds it with the original demo
   * data. Kept out of the UI copy on purpose so the app doesn't read
   * as a demo/test build.
   */
  onSecretReset(): void {
    if (this.isResetting) return;
    this.isResetting = true;
    resetDb();

    this.snackBar.open('Datos reiniciados correctamente.', undefined, {
      duration: 1600,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });

    // A full reload guarantees every screen/service starts clean against
    // the freshly-seeded database (fleet, trips, live sensor state, etc).
    setTimeout(() => window.location.reload(), 900);
  }
}
