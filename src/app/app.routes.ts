import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./core/components/landing-layout/landing-layout').then((m) => m.LandingLayout),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./core/components/dashboard-layout/dashboard-layout').then((m) => m.DashboardLayout),
  },
];
