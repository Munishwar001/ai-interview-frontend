export interface SidebarItem {
  label: string;
  icon: string;
  route: string;
  exact?: boolean;
  badge?: string;
}

export const EMPLOYER_MENU: SidebarItem[] = [
  {
    label: 'Dashboard',
    icon: 'dashboard',
    route: '/dashboard',
    exact: true
  },
  {
    label: 'Company Profile',
    icon: 'profile',
    route: '/dashboard/company-profile'
  },
  {
    label: 'Post Job',
    icon: 'post-job',
    route: '/dashboard/post-job',
    badge: 'AI'
  },
  {
    label: 'Posted Jobs',
    icon: 'applied',
    route: '/dashboard/posted-jobs'
  },
  {
    label: 'Applicants',
    icon: 'jobseeker',
    route: '/dashboard/applicants',
    badge: 'AI'
  },
  {
    label: 'Interviews',
    icon: 'interview',
    route: '/dashboard/interviews'
  },
  {
    label: 'Chats',
    icon: 'chat',
    route: '/dashboard/chats'
  },
  {
    label: 'Settings',
    icon: 'settings',
    route: '/dashboard/settings'
  }
];

export const JOBSEEKER_MENU: SidebarItem[] = [
  {
    label: 'Dashboard',
    icon: 'dashboard',
    route: '/dashboard',
    exact: true
  },
  {
    label: 'My Profile',
    icon: 'profile',
    route: '/dashboard/profile'
  },
  {
    label: 'Resume Enhancer',
    icon: 'resume',
    route: '/dashboard/resume',
    badge: 'AI'
  },
  {
    label: 'Job Recommendations',
    icon: 'jobseeker',
    route: '/dashboard/jobs',
    badge: 'AI'
  },
  {
    label: 'Applied Jobs',
    icon: 'applied',
    route: '/dashboard/applied'
  },
  {
    label: 'Mock Interview',
    icon: 'interview',
    route: '/dashboard/mock-interview',
    badge: 'AI'
  },
  {
    label: 'Chats',
    icon: 'chat',
    route: '/dashboard/chats'
  },
  {
    label: 'Settings',
    icon: 'settings',
    route: '/dashboard/settings'
  }
];