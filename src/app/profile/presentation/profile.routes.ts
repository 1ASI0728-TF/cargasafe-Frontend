import { Routes } from '@angular/router';

const profileDetailView = () =>
  import('../presentation/views/profile-detail-view/profile-detail-view').then(
    (m) => m.ProfileDetailView
  );

export const routes: Routes = [
  {
    path: '',
    loadComponent: profileDetailView,
  },
];
