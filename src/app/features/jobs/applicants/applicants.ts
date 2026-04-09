import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { map } from 'rxjs';
import { JobsService, ApplicantDto } from '../services/jobs.service';
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
  isLoading = signal(true);
  updatingId: number | null = null;
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
}
