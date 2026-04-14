import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { gsap } from 'gsap';
import { UserStore } from '../../core/services/user-store';

interface StatCard {
  title: string;
  value: number | string;
  icon: string;
  iconBg: string;
  change?: string;
  changeType?: 'positive' | 'negative';
}

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  postedTime: string;
  matchPercentage: number;
  logo: string;
}

interface Application {
  id: string;
  jobTitle: string;
  company: string;
  appliedDate: string;
  status: 'Under Review' | 'Interview' | 'Rejected';
  statusColor: string;
}

interface Applicant {
  id: string;
  name: string;
  position: string;
  appliedTime: string;
  matchPercentage: number;
  avatar: string;
}

interface Interview {
  id: string;
  candidateName: string;
  position: string;
  scheduledTime: string;
  avatar: string;
}

interface ActiveJob {
  id: string;
  title: string;
  location: string;
  applicants: number;
  status: 'active' | 'closed' | 'pending';
  statusColor: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class Dashboard implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('wavingHand') wavingHand?: ElementRef<HTMLElement>;

  userName = 'Munishwar';
  isEmployer = false;
  isNavigating = false;
  private handWaveTween?: gsap.core.Tween;

  // Job Seeker Stats
  jobSeekerStats: StatCard[] = [
    {
      title: 'Profile Completion',
      value: '75%',
      icon: '📄',
      iconBg: '#E8E5FF'
    },
    {
      title: 'Applications Sent',
      value: 12,
      icon: '💼',
      iconBg: '#F0E8FF',
      change: '+3 this week',
      changeType: 'positive'
    },
    {
      title: 'Interviews',
      value: 3,
      icon: '✅',
      iconBg: '#E5F9F0',
      change: '2 scheduled this week',
      changeType: 'positive'
    },
    {
      title: 'Profile Views',
      value: 48,
      icon: '📈',
      iconBg: '#FFF4E5',
      change: '+15% from last week',
      changeType: 'positive'
    }
  ];

  // Employer Stats
  employerStats: StatCard[] = [
    {
      title: 'Active Jobs',
      value: 8,
      icon: '💼',
      iconBg: '#E8E5FF',
      change: '+2 this month',
      changeType: 'positive'
    },
    {
      title: 'Total Applicants',
      value: 142,
      icon: '👥',
      iconBg: '#F0E8FF',
      change: '+24 this week',
      changeType: 'positive'
    },
    {
      title: 'Shortlisted',
      value: 36,
      icon: '✅',
      iconBg: '#E5F9F0',
      change: 'Ready for interview',
      changeType: 'positive'
    },
    {
      title: "This Week's Views",
      value: '1.2K',
      icon: '📊',
      iconBg: '#FFF4E5',
      change: '+18% from last week',
      changeType: 'positive'
    }
  ];

  recommendedJobs: Job[] = [
    {
      id: '1',
      title: 'Senior Frontend Developer',
      company: 'TechCorp',
      location: 'San Francisco, CA',
      salary: '$120K - $160K',
      postedTime: '2 hours ago',
      matchPercentage: 90,
      logo: '🏢'
    },
    {
      id: '2',
      title: 'Full Stack Engineer',
      company: 'StartupXYZ',
      location: 'Remote',
      salary: '$100K - $140K',
      postedTime: '5 hours ago',
      matchPercentage: 88,
      logo: '🚀'
    },
    {
      id: '3',
      title: 'React Developer',
      company: 'DigitalAgency',
      location: 'New York, NY',
      salary: '$90K - $120K',
      postedTime: '1 day ago',
      matchPercentage: 82,
      logo: '🎨'
    }
  ];

  recentApplications: Application[] = [
    {
      id: '1',
      jobTitle: 'Software Engineer',
      company: 'Google',
      appliedDate: 'Jan 28, 2024',
      status: 'Under Review',
      statusColor: '#FFA500'
    },
    {
      id: '2',
      jobTitle: 'Frontend Developer',
      company: 'Meta',
      appliedDate: 'Jan 25, 2024',
      status: 'Interview',
      statusColor: '#4CAF50'
    },
    {
      id: '3',
      jobTitle: 'Web Developer',
      company: 'Amazon',
      appliedDate: 'Jan 20, 2024',
      status: 'Rejected',
      statusColor: '#F44336'
    }
  ];

  recentApplicants: Applicant[] = [
    {
      id: '1',
      name: 'John Doe',
      position: 'Senior Frontend Developer',
      appliedTime: 'Applied 2 hours ago',
      matchPercentage: 92,
      avatar: 'J'
    },
    {
      id: '2',
      name: 'Jane Smith',
      position: 'Full Stack Engineer',
      appliedTime: 'Applied 5 hours ago',
      matchPercentage: 89,
      avatar: 'J'
    },
    {
      id: '3',
      name: 'Mike Johnson',
      position: 'React Developer',
      appliedTime: 'Applied 1 day ago',
      matchPercentage: 85,
      avatar: 'M'
    }
  ];

  upcomingInterviews: Interview[] = [
    {
      id: '1',
      candidateName: 'Sarah Chen',
      position: 'Senior Frontend Developer',
      scheduledTime: 'Today, 2:00 PM',
      avatar: 'S'
    },
    {
      id: '2',
      candidateName: 'Alex Kim',
      position: 'Full Stack Engineer',
      scheduledTime: 'Tomorrow, 10:00 AM',
      avatar: 'A'
    }
  ];

  activeJobs: ActiveJob[] = [
    {
      id: '1',
      title: 'Senior Frontend Developer',
      location: 'SF, CA',
      applicants: 45,
      status: 'active',
      statusColor: '#10b981'
    },
    {
      id: '2',
      title: 'Full Stack Engineer',
      location: 'NY, NY',
      applicants: 38,
      status: 'active',
      statusColor: '#10b981'
    },
    {
      id: '3',
      title: 'UI/UX Designer',
      location: 'Remote',
      applicants: 52,
      status: 'pending',
      statusColor: '#f59e0b'
    }
  ];

  constructor(
    private router: Router,
    private userStore: UserStore
  ) {}

  ngOnInit(): void {
    const userState = this.userStore.state;
    this.isEmployer = userState.isEmployerAccess;
    this.userName = userState.fullName || 'Munishwar';
  }

  ngAfterViewInit(): void {
    if (!this.wavingHand?.nativeElement) {
      return;
    }

    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    this.handWaveTween = gsap.fromTo(
      this.wavingHand.nativeElement,
      { rotation: 0 },
      {
        rotation: 18,
        duration: 0.22,
        ease: 'power2.inOut',
        yoyo: true,
        repeat: 5,
        transformOrigin: '70% 70%'
      }
    );
  }

  ngOnDestroy(): void {
    this.handWaveTween?.kill();
  }

  get statCards(): StatCard[] {
    return this.isEmployer ? this.employerStats : this.jobSeekerStats;
  }

  viewAllJobs(): void {
    this.navigateWithAnimation('/dashboard/jobs');
  }

  viewAllApplications(): void {
    this.navigateWithAnimation('/dashboard/applied');
  }

  viewAllApplicants(): void {
    this.navigateWithAnimation('/dashboard/applicants');
  }

  viewAllInterviews(): void {
    this.navigateWithAnimation('/dashboard/interviews');
  }

  viewAllActiveJobs(): void {
    this.navigateWithAnimation('/dashboard/posted-jobs');
  }

  enhanceResume(): void {
    this.navigateWithAnimation('/dashboard/resume');
  }

  postNewJob(): void {
    this.navigateWithAnimation('/dashboard/post-job');
  }

  applyToJob(jobId: string): void {
    console.log('Apply to job:', jobId);
  }

  private navigateWithAnimation(route: string): void {
    this.isNavigating = true;
    setTimeout(() => {
      this.router.navigate([route]);
    }, 300);
  }
}
