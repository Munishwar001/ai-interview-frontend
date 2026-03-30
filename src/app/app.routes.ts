import { Routes } from '@angular/router';
import { authGuard } from './auth/guard/auth-guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./core/components/landing-layout/landing-layout').then((m) => m.LandingLayout),
     children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./pages/landingpage/landingpage')
            .then((m) => m.Landingpage),
      },
    ]
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
    canMatch: [authGuard],
    loadComponent: () =>
      import('./core/components/dashboard-layout/dashboard-layout').then((m) => m.DashboardLayout),
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFoundComponent),
  },
];
