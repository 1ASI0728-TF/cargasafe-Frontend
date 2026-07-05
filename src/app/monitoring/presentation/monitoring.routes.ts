import { Routes } from '@angular/router';

const monitoringPage = () =>
  import('./views/vehicle-monitoring/vehicle-monitoring.component').then(
    (m) => m.VehicleMonitoringComponent
  );

export const routes: Routes = [
  {
    path: '',
    loadComponent: monitoringPage,
  },
];
