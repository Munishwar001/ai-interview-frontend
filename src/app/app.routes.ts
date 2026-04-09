import { Routes } from '@angular/router';
import { authGuard } from './auth/guard/auth-guard';
import { UserRole } from './shared/enums/UserRole ';
import { userAccessGuard } from './core/guard/user-access-guard';
import { authRedirectGuard } from './auth/guard/auth-redirect-guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./core/components/landing-layout/landing-layout').then((m) => m.LandingLayout),
    children: [
      {
        path: '',
        pathMatch: 'full',
        canMatch: [authRedirectGuard],
        loadComponent: () => import('./pages/landingpage/landingpage').then((m) => m.Landingpage),
      },
    ],
  },
  {
    path: 'login',
    canMatch: [authRedirectGuard],
    loadComponent: () => import('./auth/components/login/login').then((m) => m.Login),
  },
  {
    path: 'signup',
    canMatch: [authRedirectGuard],
    loadComponent: () => import('./auth/components/signup/signup').then((m) => m.Signup),
  },
  {
    path: 'dashboard',
    canMatch: [authGuard],
    loadComponent: () =>
      import('./core/components/dashboard-layout/dashboard-layout').then((m) => m.DashboardLayout),
    children: [
      {
        path: 'post-job',
        canMatch: [authGuard, userAccessGuard],
        data: { restrictedUserTypes: [UserRole.JobSeeker] },
        loadComponent: () =>
          import('./features/post-job/post-job-home/post-job-home').then((m) => m.PostJobHome),
      },
      {
        path: 'posted-jobs',
        canMatch: [authGuard, userAccessGuard],
        data: { restrictedUserTypes: [UserRole.JobSeeker] },
        loadComponent: () =>
          import('./features/posted-job/posted-job-home/posted-job-home').then((m) => m.PostedJobHome),
      },
      {
        path: 'company-profile',
        canMatch: [authGuard, userAccessGuard],
        data: { restrictedUserTypes: [UserRole.JobSeeker] },
        loadComponent: () =>
          import('./features/profiles/company-profile/company-profile').then((m) => m.CompanyProfile),
      },
      {
        path: 'profile',
        canMatch: [authGuard, userAccessGuard],
        data: { restrictedUserTypes: [UserRole.Employer] },
        loadComponent: () =>
          import('./features/profiles/user-profile/user-profile').then((m) => m.UserProfile),
      },
      {
        path: 'resume',
        canMatch: [authGuard, userAccessGuard],
        data: { restrictedUserTypes: [UserRole.Employer] },
        loadComponent: () =>
          import('./features/resume-enhancer/resume-enhancer').then((m) => m.ResumeEnhancer),
      },
      {
        path: 'mock-interview',
        canMatch: [authGuard, userAccessGuard],
        data: { restrictedUserTypes: [UserRole.Employer] },
        loadComponent: () =>
          import('./features/mock-interview/mock-interview').then((m) => m.MockInterview),
      },
      {
        path: 'chat-interview',
        canMatch: [authGuard, userAccessGuard],
        data: { restrictedUserTypes: [UserRole.Employer] },
        loadComponent: () =>
          import('./features/chat-interview/chat-interview').then((m) => m.ChatInterview),
      },
      {
        path: 'jobs',
        canMatch: [authGuard, userAccessGuard],
        data: { restrictedUserTypes: [UserRole.Employer] },
        loadComponent: () =>
          import('./features/jobs/job-recommendations/job-recommendations').then((m) => m.JobRecommendations),
      },
      {
        path: 'applied',
        canMatch: [authGuard, userAccessGuard],
        data: { restrictedUserTypes: [UserRole.Employer] },
        loadComponent: () =>
          import('./features/jobs/applied-jobs/applied-jobs').then((m) => m.AppliedJobs),
      },
      {
        path: 'applicants',
        canMatch: [authGuard, userAccessGuard],
        data: { restrictedUserTypes: [UserRole.JobSeeker] },
        loadComponent: () =>
          import('./features/jobs/applicants/applicants').then((m) => m.Applicants),
      },
      {
        path: 'applicants/:jobId',
        canMatch: [authGuard, userAccessGuard],
        data: { restrictedUserTypes: [UserRole.JobSeeker] },
        loadComponent: () =>
          import('./features/jobs/applicants/applicants').then((m) => m.Applicants),
      },
    ],
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFoundComponent),
  },
];
