import { Routes } from '@angular/router';

const listPage = () =>
  import('./views/alerts-views/alerts-views.component')
    .then((m) => m.AlertsViewsComponent);

export const routes: Routes = [
  {
    path: '',
    loadComponent: listPage,
  },
];
