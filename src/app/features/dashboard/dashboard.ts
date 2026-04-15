import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { gsap } from 'gsap';
import { Icons } from '../../shared/icons/icons';
import { UserStore } from '../../core/services/user-store';
import { JobsService, ApplicantDto, InterviewDto, JobListItem } from '../jobs/services/jobs.service';
import { JobService, MyJobDto } from '../post-job/services/post-job';
import { JobSeekerService } from '../profiles/user-profile/services/job-seeker.service';
import { CompanyProfileService } from '../profiles/company-profile/Services/company-profile.service';
import { catchError, forkJoin, map, of } from 'rxjs';
import { PoweredBadgeComponent } from '../../shared/components/powered-badge/powered-badge';

interface StatCard {
  title: string;
  value: number | string;
  iconName: string;
  iconClass?: string;
  iconBg: string;
  change?: string;
  changeType?: 'positive' | 'negative';
}

interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  jobType?: string;
  skills?: string[];
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
  imports: [CommonModule, RouterModule, Icons, PoweredBadgeComponent],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class Dashboard implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('wavingHand') wavingHand?: ElementRef<HTMLElement>;

  userName = 'User';
  isEmployer = false;
  isNavigating = false;
  isLoading = false;
  brokenJobLogoIds = new Set<string>();
  private handWaveTween?: gsap.core.Tween;

  jobSeekerStats: StatCard[] = this.buildDefaultJobSeekerStats();
  employerStats: StatCard[] = this.buildDefaultEmployerStats();
  recommendedJobs: Job[] = [];
  recentApplications: Application[] = [];
  recentApplicants: Applicant[] = [];
  upcomingInterviews: Interview[] = [];
  activeJobs: ActiveJob[] = [];

  constructor(
    private router: Router,
    private userStore: UserStore,
    private jobsService: JobsService,
    private jobService: JobService,
    private jobSeekerService: JobSeekerService,
    private companyProfileService: CompanyProfileService,
  ) {}

  ngOnInit(): void {
    const userState = this.userStore.state;
    this.isEmployer = userState.isEmployerAccess;
    this.userName = userState.fullName || 'Munishwar';
    this.loadDashboardData();
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

  private loadDashboardData(): void {
    this.isLoading = true;
    this.recommendedJobs = [];
    this.recentApplications = [];
    this.recentApplicants = [];
    this.upcomingInterviews = [];
    this.activeJobs = [];

    if (this.isEmployer) {
      this.employerStats = this.buildDefaultEmployerStats();
      this.loadEmployerDashboard();
      return;
    }

    this.jobSeekerStats = this.buildDefaultJobSeekerStats();
    this.loadJobSeekerDashboard();
  }

  private loadJobSeekerDashboard(): void {
    forkJoin({
      profile: this.jobSeekerService.getProfile().pipe(catchError(() => of(null))),
      profileViews: this.jobSeekerService.getProfileViews().pipe(map((res) => res.views), catchError(() => of(0))),
      recommended: this.jobsService.getLatestJobs(3).pipe(catchError(() => of([] as JobListItem[]))),
      applications: this.jobsService.getMyApplications().pipe(catchError(() => of([] as any[]))),
      interviews: this.jobsService.getMyInterviews().pipe(catchError(() => of([] as InterviewDto[]))),
    }).subscribe(({ profile, profileViews, recommended, applications, interviews }) => {
      const sortedApps = [...applications].sort((a, b) => this.toMillis(b?.appliedAt ?? b?.createdAt) - this.toMillis(a?.appliedAt ?? a?.createdAt));

      this.recommendedJobs = recommended.slice(0, 3).map((job, idx) => this.toDashboardJob(job, idx));
      this.recentApplications = sortedApps.slice(0, 3).map((item) => this.toDashboardApplication(item));

      const profileCompletion = profile?.profileCompletion ?? 0;
      const interviewsCount = interviews.length;
      const applicationsCount = applications.length;

      this.jobSeekerStats = [
        {
          title: 'Profile Completion',
          value: `${profileCompletion}%`,
          iconName: 'user-circle',
          iconClass: 'w-5 h-5 text-indigo-600',
          iconBg: '#E8E5FF'
        },
        {
          title: 'Applications Sent',
          value: applicationsCount,
          iconName: 'work',
          iconClass: 'w-6 h-6 text-indigo-600',
          iconBg: '#F0E8FF',
          change: `${applicationsCount} total applications`,
          changeType: 'positive'
        },
        {
          title: 'Interviews',
          value: interviewsCount,
          iconName: 'circle-check',
          iconClass: 'w-6 h-6 text-emerald-500',
          iconBg: '#E5F9F0',
          change: `${interviewsCount} scheduled`,
          changeType: 'positive'
        },
        {
          title: 'Profile Views',
          value: profileViews,
          iconName: 'eye',
          iconClass: 'w-6 h-6 text-orange-500',
          iconBg: '#FFF4E5',
          change: 'Total profile views',
          changeType: 'positive'
        }
      ];

      this.isLoading = false;
    });
  }

  private loadEmployerDashboard(): void {
    this.jobService.getMyJobs().pipe(
      map((response) => this.extractJobs(response)),
      catchError(() => of([] as MyJobDto[]))
    ).subscribe((jobs) => {
      if (!jobs.length) {
        this.employerStats = [
          { title: 'Active Jobs', value: 0, iconName: 'work', iconClass: 'w-6 h-6 text-indigo-600', iconBg: '#E8E5FF' },
          { title: 'Total Applicants', value: 0, iconName: 'users', iconClass: 'w-5 h-5 text-purple-800', iconBg: '#F0E8FF' },
          { title: 'Shortlisted', value: 0, iconName: 'circle-check', iconClass: 'w-6 h-6 text-emerald-500', iconBg: '#E5F9F0' },
          { title: "This Week's Views", value: 0, iconName: 'eye', iconClass: 'w-6 h-6 text-orange-500', iconBg: '#FFF4E5' }
        ];
        this.recentApplicants = [];
        this.upcomingInterviews = [];
        this.activeJobs = [];
        this.isLoading = false;
        return;
      }

      const applicantsRequests = jobs.map((job) =>
        this.jobsService.getApplicants(job.id).pipe(
          map((applicants) => applicants.map((applicant) => ({ applicant, job }))),
          catchError(() => of([] as Array<{ applicant: ApplicantDto; job: MyJobDto }>))
        )
      );

      const interviewsRequests = jobs.map((job) =>
        this.jobsService.getInterviewsByJob(job.id).pipe(
          map((interviews) => interviews.map((interview) => ({ interview, job }))),
          catchError(() => of([] as Array<{ interview: InterviewDto; job: MyJobDto }>))
        )
      );

      forkJoin({
        applicantsGroups: forkJoin(applicantsRequests),
        interviewGroups: forkJoin(interviewsRequests),
        profileViews: this.companyProfileService.getProfileViews().pipe(map((res) => res.views), catchError(() => of(0))),
      }).subscribe(({ applicantsGroups, interviewGroups, profileViews }) => {
        const allApplicants = applicantsGroups.flat();
        const allInterviews = interviewGroups.flat();

        const activeJobsCount = jobs.filter((job) => !job.isClosed && (job.status ?? '').toLowerCase() !== 'closed').length;
        const totalApplicants = jobs.reduce((sum, job) => sum + Number(job.applicantsCount ?? job.applicants ?? 0), 0);
        const totalShortlisted = jobs.reduce((sum, job) => sum + Number(job.shortlistedCount ?? job.shortlisted ?? 0), 0);
        const totalViews = jobs.reduce((sum, job) => sum + Number(job.viewsCount ?? job.views ?? 0), 0);

        this.employerStats = [
          {
            title: 'Active Jobs',
            value: activeJobsCount,
            iconName: 'work',
            iconClass: 'w-6 h-6 text-indigo-600',
            iconBg: '#E8E5FF',
            change: `${jobs.length} total jobs`,
            changeType: 'positive'
          },
          {
            title: 'Total Applicants',
            value: totalApplicants,
            iconName: 'users',
            iconClass: 'w-5 h-5 text-purple-800',
            iconBg: '#F0E8FF',
            change: `${allApplicants.length} fetched records`,
            changeType: 'positive'
          },
          {
            title: 'Shortlisted',
            value: totalShortlisted,
            iconName: 'circle-check',
            iconClass: 'w-6 h-6 text-emerald-500',
            iconBg: '#E5F9F0',
            change: 'Ready for interview',
            changeType: 'positive'
          },
          {
            title: "This Week's Views",
            value: profileViews >= 1000 ? `${(profileViews / 1000).toFixed(1)}K` : profileViews,
            iconName: 'eye',
            iconClass: 'w-6 h-6 text-orange-500',
            iconBg: '#FFF4E5',
            change: totalViews > 0 ? `${totalViews} job views total` : 'Company profile views',
            changeType: 'positive'
          }
        ];

        this.recentApplicants = allApplicants
          .sort((a, b) => this.toMillis(b.applicant.appliedAt) - this.toMillis(a.applicant.appliedAt))
          .slice(0, 3)
          .map(({ applicant, job }) => ({
            id: String(applicant.applicationId),
            name: applicant.applicantName || 'Unknown Applicant',
            position: job.title || 'Untitled Job',
            appliedTime: this.relativeTime(applicant.appliedAt),
            matchPercentage: this.statusToMatch(applicant.status),
            avatar: (applicant.applicantName || 'U').charAt(0).toUpperCase(),
          }));

        this.upcomingInterviews = allInterviews
          .sort((a, b) => this.toMillis(a.interview.scheduledAt) - this.toMillis(b.interview.scheduledAt))
          .slice(0, 2)
          .map(({ interview, job }) => ({
            id: String(interview.interviewId ?? interview.id ?? 0),
            candidateName: 'Scheduled Candidate',
            position: job.title || 'Untitled Job',
            scheduledTime: interview.scheduledAt ? new Date(interview.scheduledAt).toLocaleString() : 'Schedule pending',
            avatar: 'C',
          }));

        this.activeJobs = jobs.slice(0, 3).map((job) => {
          const status = this.mapJobStatus(job);
          return {
            id: String(job.id),
            title: job.title || 'Untitled Job',
            location: job.location || 'Remote',
            applicants: Number(job.applicantsCount ?? job.applicants ?? 0),
            status,
            statusColor: status === 'active' ? '#10b981' : status === 'pending' ? '#f59e0b' : '#9ca3af',
          };
        });

        this.isLoading = false;
      });
    });
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

  private toDashboardJob(job: JobListItem, idx: number): Job {
    return {
      id: String(job.jobId),
      title: job.title || 'Untitled Role',
      company: job.companyName || 'Unknown Company',
      companyLogo: job.companyLogo,
      location: job.location || 'Remote',
      jobType: job.jobType || 'Not specified',
      skills: job.skills ?? [],
      salary: this.formatSalary(job.salaryMin, job.salaryMax),
      postedTime: this.relativeTime(job.postedDate),
      matchPercentage: Math.max(70, 95 - idx * 7),
      logo: (job.companyName || 'C').charAt(0).toUpperCase(),
    };
  }

  showJobLogo(job: Job): boolean {
    return !!job.companyLogo && !this.brokenJobLogoIds.has(job.id);
  }

  onJobLogoError(jobId: string, event: Event): void {
    this.brokenJobLogoIds.add(jobId);
    const img = event.target as HTMLImageElement;
    img.src = '';
  }

  private toDashboardApplication(item: any): Application {
    const status = this.normalizeApplicationStatus(item?.status);
    return {
      id: String(item?.applicationId ?? item?.id ?? 0),
      jobTitle: item?.title ?? item?.jobTitle ?? 'Untitled Role',
      company: item?.companyName ?? item?.company ?? 'Unknown Company',
      appliedDate: this.formatDate(item?.appliedAt ?? item?.createdAt),
      status,
      statusColor: this.applicationStatusColor(status),
    };
  }

  private extractJobs(response: MyJobDto[] | { data?: MyJobDto[]; items?: MyJobDto[]; result?: MyJobDto[] }): MyJobDto[] {
    if (Array.isArray(response)) {
      return response;
    }
    return response.data ?? response.items ?? response.result ?? [];
  }

  private formatSalary(min?: number | null, max?: number | null): string {
    if (!min && !max) return 'Not disclosed';
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `From $${min.toLocaleString()}`;
    return `Up to $${(max ?? 0).toLocaleString()}`;
  }

  private formatDate(value?: string): string {
    if (!value) return 'Recently';
    const dt = new Date(value);
    if (Number.isNaN(dt.getTime())) return 'Recently';
    return dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }

  private relativeTime(value?: string): string {
    if (!value) return 'Recently';
    const ts = this.toMillis(value);
    if (!ts) return 'Recently';
    const hours = Math.floor((Date.now() - ts) / 3600000);
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    return days === 1 ? '1 day ago' : `${days} days ago`;
  }

  private toMillis(value?: string): number {
    if (!value) return 0;
    const dt = new Date(value);
    return Number.isNaN(dt.getTime()) ? 0 : dt.getTime();
  }

  private normalizeApplicationStatus(status?: string): 'Under Review' | 'Interview' | 'Rejected' {
    const key = (status ?? '').toLowerCase();
    if (key.includes('interview') || key.includes('shortlisted') || key.includes('hired')) return 'Interview';
    if (key.includes('reject')) return 'Rejected';
    return 'Under Review';
  }

  private applicationStatusColor(status: 'Under Review' | 'Interview' | 'Rejected'): string {
    if (status === 'Interview') return '#4CAF50';
    if (status === 'Rejected') return '#F44336';
    return '#FFA500';
  }

  private statusToMatch(status?: string): number {
    const key = (status ?? '').toLowerCase();
    if (key.includes('hired')) return 96;
    if (key.includes('shortlisted')) return 90;
    if (key.includes('pending')) return 80;
    return 72;
  }

  private mapJobStatus(job: MyJobDto): 'active' | 'closed' | 'pending' {
    if (job.isClosed || (job.status ?? '').toLowerCase() === 'closed') return 'closed';
    if ((job.status ?? '').toLowerCase() === 'pending') return 'pending';
    return 'active';
  }

  private buildDefaultJobSeekerStats(): StatCard[] {
    return [
      { title: 'Profile Completion', value: '0%', iconName: 'user-circle', iconClass: 'w-5 h-5 text-indigo-600', iconBg: '#E8E5FF' },
      { title: 'Applications Sent', value: 0, iconName: 'work', iconClass: 'w-6 h-6 text-indigo-600', iconBg: '#F0E8FF', change: 'No applications yet', changeType: 'positive' },
      { title: 'Interviews', value: 0, iconName: 'circle-check', iconClass: 'w-6 h-6 text-emerald-500', iconBg: '#E5F9F0', change: 'No interviews yet', changeType: 'positive' },
      { title: 'Profile Views', value: 0, iconName: 'eye', iconClass: 'w-6 h-6 text-orange-500', iconBg: '#FFF4E5', change: 'No activity yet', changeType: 'positive' }
    ];
  }

  private buildDefaultEmployerStats(): StatCard[] {
    return [
      { title: 'Active Jobs', value: 0, iconName: 'work', iconClass: 'w-6 h-6 text-indigo-600', iconBg: '#E8E5FF', change: 'No jobs yet', changeType: 'positive' },
      { title: 'Total Applicants', value: 0, iconName: 'users', iconClass: 'w-5 h-5 text-purple-800', iconBg: '#F0E8FF', change: 'No applicants yet', changeType: 'positive' },
      { title: 'Shortlisted', value: 0, iconName: 'circle-check', iconClass: 'w-6 h-6 text-emerald-500', iconBg: '#E5F9F0', change: 'No shortlist yet', changeType: 'positive' },
      { title: "This Week's Views", value: 0, iconName: 'eye', iconClass: 'w-6 h-6 text-orange-500', iconBg: '#FFF4E5', change: 'No views yet', changeType: 'positive' }
    ];
  }

  private navigateWithAnimation(route: string): void {
    this.isNavigating = true;
    setTimeout(() => {
      this.router.navigate([route]);
    }, 300);
  }
}
