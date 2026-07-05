import { Component, inject, OnDestroy, signal, effect } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule, NavigationEnd, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { UserStore } from '../../../../iam/application/user.store';
import { AuthService } from '../../../../iam/application/auth.service.';
import { resetDb } from '../../../../core/fake-backend/fake-db';
import { LongPressDirective } from '../../directives/long-press.directive';

@Component({
  selector: 'app-root-layout',
  imports: [RouterModule, MatIconModule, MatButtonModule, CommonModule, MatSnackBarModule, LongPressDirective],
  templateUrl: './root-layout.html',
  styleUrls: ['./root-layout.css'],
})
export class RootLayout implements OnDestroy {
  // Use Angular signals for reactivity and simpler template binding
  sidebarOpen = signal(false);
  userStore = inject(UserStore);
  authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private routerSub?: Subscription;

  /** 0..1 fill progress of the hidden "hold logo to reset" gesture. */
  resetProgress = signal(0);
  private isResetting = false;

  constructor(private router: Router) {
    // Close sidebar on route change
    this.routerSub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.sidebarOpen.set(false);
      }
    });

    // Load user data on initialization
    this.userStore.loadUser();

    // Debug: Log user changes
    effect(() => {
      const user = this.userStore.user();
      console.log('User changed in RootLayout:', user);
      console.log('User roles:', user?.roles);
      console.log('Is Operator?', user?.isOperator());
      console.log('Is Client?', user?.isClient());
    });
  }

  toggleSidebar(open?: boolean) {
    if (typeof open === 'boolean') {
      this.sidebarOpen.set(open);
    } else {
      this.sidebarOpen.update((v) => !v);
    }
  }

  onLogout(event: Event): void {
    event.preventDefault();

    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Logout error:', err);
        // Even if the API call fails, clear local data and redirect
        this.router.navigate(['/login']);
      }
    });
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }

  /** Visual feedback (0..1) while the CargaSafe logo is being held down. */
  onResetProgress(progress: number): void {
    this.resetProgress.set(progress);
  }

  /**
   * Hidden trick: holding the CargaSafe logo for 3 seconds wipes the
   * fake, in-browser database and reseeds it with the original demo
   * data. Not documented anywhere in the UI on purpose.
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

    // Reload so every store/service/signal starts clean against the
    // freshly-seeded database instead of trying to reconcile in place.
    setTimeout(() => window.location.reload(), 900);
  }
}
