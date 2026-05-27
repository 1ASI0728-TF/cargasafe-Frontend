import { Component, inject, OnDestroy, signal, effect } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule, NavigationEnd, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { UserStore } from '../../../../iam/application/user.store';
import { AuthService } from '../../../../iam/application/auth.service.';

@Component({
  selector: 'app-root-layout',
  imports: [RouterModule, MatIconModule, MatButtonModule, CommonModule],
  templateUrl: './root-layout.html',
  styleUrls: ['./root-layout.css'],
})
export class RootLayout implements OnDestroy {
  // Use Angular signals for reactivity and simpler template binding
  sidebarOpen = signal(false);
  userStore = inject(UserStore);
  authService = inject(AuthService);
  private routerSub?: Subscription;

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
}
