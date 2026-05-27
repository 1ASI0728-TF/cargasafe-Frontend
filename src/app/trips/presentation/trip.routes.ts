import { Routes } from '@angular/router';

const listPage = () =>
  import('./views/trip-list-view/trip-list-view.component').then((m) => m.TripListViewComponent);
const detailPage = () =>
  import('./views/trip-detail-view/trip-detail-view.component').then(
    (m) => m.TripDetailViewComponent
  );
const createPage = () =>
  import('./views/trip-create-view/trip-create-view.component').then(
    (m) => m.TripCreateViewComponent
  );

export const routes: Routes = [
  {
    path: '',
    loadComponent: listPage,
  },
  {
    path: 'create',
    loadComponent: createPage,
  },
  {
    path: ':id',
    loadComponent: detailPage,
  },
];
