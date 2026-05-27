import { Routes } from '@angular/router';
import { RootLayout } from './shared/presentation/layout/root-layout/root-layout';
import { PageNotFound } from './shared/presentation/views/page-not-found/page-not-found';
import { DashboardComponent } from './dashboard/presentation/views/dashboard.component';
import { TripDetailComponent } from './dashboard/presentation/components/trip-detail/trip-detail.component';
import { LoginPageComponent } from './iam/presentation/pages/login-page/login-page';
import { PasswordRecoveryPageComponent } from './iam/presentation/pages/password-recovery-page/password-recovery-page';
import { RegisterPageComponent } from './iam/presentation/pages/register-page/register-page';
import { SubscriptionsPage } from './subscription/presentation/pages/subscriptions/subscriptions.page';

const tripRoutes = () => import('./trips/presentation/trip.routes').then((m) => m.routes);
const alertRoutes = () => import('./alerts/presentation/alert.routes').then((m) => m.routes);
const fleetRoutes = () => import('./fleet/presentation/fleet.routes').then((m) => m.routes);
const profileRoutes = () => import('./profile/presentation/profile.routes').then((m) => m.routes);

// app.routes.ts (root)
export const routes: Routes = [
  { path: 'login', component: LoginPageComponent },
  { path: 'password-recovery', component: PasswordRecoveryPageComponent },
  { path: 'register', component: RegisterPageComponent },
  {
    path: '',
    component: RootLayout,
    children: [
      {
        path: '',
        redirectTo: '/login',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
      },
      {
        path: 'dashboard/trips/:id',
        component: TripDetailComponent,
      },
      {
        path: 'trips',
        loadChildren: tripRoutes,
      },
      {
        path: 'alerts',
        loadChildren: alertRoutes,
      },
      {
        path: 'fleet',
        loadChildren: fleetRoutes,
      },
      {
        path: 'profile',
        loadChildren: profileRoutes,
      },
      {
        path: 'subscriptions/change-card',
        loadComponent: () =>
          import('./subscription/presentation/pages/change-card/change-card.page').then(
            (m) => m.ChangeCardPage
          ),
      },

      { path: 'subscriptions', component: SubscriptionsPage },

      { path: '**', component: PageNotFound },
    ],
  },
];
