import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs';
import { JobsService, ApplicantDto, InterviewDto } from '../services/jobs.service';
import { ToastrService } from 'ngx-toastr';
import { JobService, MyJobDto } from '../../post-job/services/post-job';
import { environment } from '../../../../../environment/environment';

interface ApplicantViewModel extends ApplicantDto {
  jobId?: number;
  jobTitle?: string;
  companyName?: string;
  companyLogo?: string;
}

const STATUSES = ['Pending', 'Shortlisted', 'Rejected', 'Hired'] as const;
type AppStatus = typeof STATUSES[number];

@Component({
  selector: 'app-applicants',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './applicants.html',
})
export class Applicants implements OnInit {
  jobId: number | null = null;
  applicants = signal<ApplicantViewModel[]>([]);
  interviewsByApplication = signal<Record<number, InterviewDto[]>>({});
  isLoading = signal(true);
  updatingId: number | null = null;
  isScheduleModalOpen = false;
  schedulingApplicant: ApplicantViewModel | null = null;
  schedulingInterview = false;
  scheduledAt = '';
  scheduleNotes = '';
  filterStatus = 'All';
  search = '';
  selectedApplicant: ApplicantViewModel | null = null;

  readonly statuses = ['All', ...STATUSES];
  readonly statusOptions = [...STATUSES];

  constructor(
    private route: ActivatedRoute,
    private svc: JobsService,
    private jobService: JobService,
    private toastr: ToastrService,
  ) {}

  ngOnInit() {
    const rawJobId = this.route.snapshot.paramMap.get('jobId');
    this.jobId = rawJobId ? Number(rawJobId) : null;
    this.load();
  }

  load() {
    this.isLoading.set(true);

    if (this.jobId) {
      this.svc.getApplicants(this.jobId).subscribe({
        next: (data) => {
          this.applicants.set(data);
          this.loadInterviewsForJob(this.jobId!);
          this.isLoading.set(false);
        },
        error: () => { this.isLoading.set(false); },
      });
      return;
    }

    this.jobService.getMyJobs().subscribe({
      next: (response) => {
        const jobs = this.extractJobs(response);
        if (!jobs.length) {
          this.applicants.set([]);
          this.isLoading.set(false);
          return;
        }

        forkJoin(jobs.map((job) => this.svc.getApplicants(job.id).pipe(
          map((apps) => apps.map((app) => ({
            ...app,
            jobId: job.id,
            jobTitle: this.readJobField<string>(job, 'title', 'Title') || 'Untitled Job',
            companyName: this.readJobField<string>(job, 'companyName', 'CompanyName') || app.applicantName || '',
            companyLogo: this.toAbsoluteUrl(this.readJobField<string>(job, 'companyLogo', 'CompanyLogo')),
          })))
        ))).subscribe({
          next: (resultSets) => {
            this.applicants.set(resultSets.flat());
            this.isLoading.set(false);
          },
          error: () => { this.isLoading.set(false); },
        });
      },
      error: () => { this.isLoading.set(false); },
    });
  }

  get filtered(): ApplicantViewModel[] {
    return this.applicants().filter(a => {
      const matchStatus = this.filterStatus === 'All' || a.status === this.filterStatus;
      const matchSearch = !this.search || a.applicantName?.toLowerCase().includes(this.search.toLowerCase()) || a.jobTitle?.toLowerCase().includes(this.search.toLowerCase());
      return matchStatus && matchSearch;
    });
  }

  updateStatus(app: ApplicantDto, status: string) {
    this.updatingId = app.applicationId;
    this.svc.updateStatus(app.applicationId, status).subscribe({
      next: () => {
        this.applicants.update(list =>
          list.map(a => a.applicationId === app.applicationId ? { ...a, status } : a)
        );
        if (this.selectedApplicant?.applicationId === app.applicationId) {
          this.selectedApplicant = { ...this.selectedApplicant, status };
        }
        this.toastr.success(`Status updated to ${status}`);
        this.updatingId = null;
      },
      error: () => { this.toastr.error('Failed to update status.'); this.updatingId = null; },
    });
  }

  openScheduleInterview(app: ApplicantViewModel) {
    if ((app.status || '').toLowerCase() !== 'shortlisted') {
      this.toastr.warning('Only shortlisted applicants can be scheduled for interview.');
      return;
    }

    this.schedulingApplicant = app;
    this.scheduledAt = '';
    this.scheduleNotes = '';
    this.isScheduleModalOpen = true;
  }

  closeScheduleModal() {
    this.isScheduleModalOpen = false;
    this.schedulingInterview = false;
    this.schedulingApplicant = null;
    this.scheduledAt = '';
    this.scheduleNotes = '';
  }

  scheduleInterview() {
    if (!this.schedulingApplicant) return;
    if (!this.scheduledAt) {
      this.toastr.error('Please select interview date and time.');
      return;
    }

    const scheduledUtc = new Date(this.scheduledAt).toISOString();
    if (new Date(scheduledUtc).getTime() <= Date.now()) {
      this.toastr.error('Interview time must be in the future.');
      return;
    }

    this.schedulingInterview = true;
    this.svc.scheduleInterview(this.schedulingApplicant.applicationId, {
      scheduledAt: scheduledUtc,
      notes: this.scheduleNotes || undefined,
    }).subscribe({
      next: (interview) => {
        const appId = this.schedulingApplicant!.applicationId;
        this.interviewsByApplication.update((state) => ({
          ...state,
          [appId]: [...(state[appId] || []), interview],
        }));

        this.toastr.success('Interview scheduled successfully.');

        const url = this.getInterviewJoinUrl(interview);
        if (url) {
          window.open(url, '_blank');
        }

        this.closeScheduleModal();
      },
      error: (err) => {
        this.toastr.error(err?.error?.detail || 'Failed to schedule interview.');
        this.schedulingInterview = false;
      },
    });
  }

  getInterviewJoinUrl(interview: InterviewDto): string | null {
    const candidates = [
      interview.meetingUrl,
      interview.joinUrl,
      interview.roomUrl,
      interview['url'] as string | undefined,
    ];

    const value = candidates.find((item) => typeof item === 'string' && !!item.trim());
    if (value) return value;

    const id = Number(interview.interviewId ?? interview.id ?? 0);
    if (!id) return null;
    return `/dashboard/interviews/${id}`;
  }

  getInterviewsForApplication(applicationId: number): InterviewDto[] {
    return this.interviewsByApplication()[applicationId] || [];
  }

  resumeUrl(path?: string): string | null {
    if (!path) return null;
    return path.startsWith('http') ? path : `${environment.url}${path}`;
  }

  statusColor(status: string): string {
    switch (status?.toLowerCase()) {
      case 'hired':       return 'bg-green-100 text-green-700 border-green-200';
      case 'shortlisted': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'rejected':    return 'bg-red-100 text-red-600 border-red-200';
      default:            return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    }
  }

  countByStatus(status: string): number {
    return this.applicants().filter(a => a.status?.toLowerCase() === status.toLowerCase()).length;
  }

  private extractJobs(response: MyJobDto[] | { data?: MyJobDto[]; items?: MyJobDto[]; result?: MyJobDto[] }): MyJobDto[] {
    if (Array.isArray(response)) {
      return response;
    }

    return response.data ?? response.items ?? response.result ?? [];
  }

  private readJobField<T>(source: unknown, camelKey: string, pascalKey: string): T | undefined {
    const item = source as Record<string, unknown>;
    const camelValue = item[camelKey] as T | undefined;
    if (camelValue !== undefined && camelValue !== null) {
      return camelValue;
    }
    return item[pascalKey] as T | undefined;
  }

  private toAbsoluteUrl(path?: string): string | undefined {
    if (!path) return undefined;
    if (path.startsWith('http')) return path;
    const base = (environment.url || '').replace(/\/$/, '');
    return `${base}${path}`;
  }

  private loadInterviewsForJob(jobId: number) {
    this.svc.getInterviewsByJob(jobId).subscribe({
      next: (interviews) => {
        const grouped: Record<number, InterviewDto[]> = {};
        for (const interview of interviews) {
          const applicationId = Number(interview.applicationId || 0);
          if (!applicationId) continue;
          grouped[applicationId] = [...(grouped[applicationId] || []), interview];
        }
        this.interviewsByApplication.set(grouped);
      },
      error: () => {
        this.interviewsByApplication.set({});
      },
    });
  }
}
