import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./core/components/landing-layout/landing-layout').then((m) => m.LandingLayout),
  },
  {
    path: 'login',
    loadComponent: () => import('./auth/components/login/login').then((m) => m.Login),
  },
  {
    path: 'signup',
    loadComponent: () => import('./auth/components/signup/signup').then((m) => m.Signup),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./core/components/dashboard-layout/dashboard-layout').then((m) => m.DashboardLayout),
  },
];
