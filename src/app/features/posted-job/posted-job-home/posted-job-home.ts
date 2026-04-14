import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge';
import { JobService, MyJobDto } from '../../post-job/services/post-job';
import { MarkdownService } from '../../../shared/services/markdown.service';
import { environment } from '../../../../../environment/environment';
import { Icons } from '../../../shared/icons/icons';

interface Job {
  id: number;
  title: string;
  company: string;
  companyLogo: string;
  companyDescription: string;
  companyInitials: string;
  location: string;
  type: string;
  salary: string;
  postedDate: string;
  status: 'Active' | 'Closed';
  applicants: number;
  views: number;
  shortlisted: number;
  description: string;
  skills: string[];
}

@Component({
  selector: 'app-posted-job-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, StatusBadge, Icons],
  templateUrl: './posted-job-home.html',
})
export class PostedJobHome implements OnInit {
  searchQuery = '';
  activeFilter = 'All';
  filters = ['All', 'Active', 'Closed'];
  jobs: Job[] = [];
  isLoading = false;
  errorMessage = '';
  isDeleteDialogOpen = false;
  pendingDeleteJob: Job | null = null;
  isDeleting = false;
  selectedJob: Job | null = null;
  isPreviewOpen = false;

  constructor(
    private jobService: JobService,
    private markdownService: MarkdownService,
    private router: Router,
  ) {}

  viewApplicants(jobId: number) {
    this.router.navigate(['/dashboard/applicants', jobId]);
  }

  get filteredJobs(): Job[] {
    return this.jobs.filter((job) => {
      const matchFilter = this.activeFilter === 'All' || job.status === this.activeFilter;
      const matchSearch = job.title.toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchFilter && matchSearch;
    });
  }

  ngOnInit(): void {
    this.loadJobs();
  }

  loadJobs(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.jobService.getMyJobs().subscribe({
      next: (response) => {
        this.jobs = this.extractJobs(response).map((job) => this.mapApiJobToUi(job));
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Unable to load jobs. Please try again.';
        this.isLoading = false;
      },
    });
  }

  onClose(job: Job): void {
    if (job.status !== 'Active') {
      return;
    }

    this.jobService.closeJob(job.id).subscribe({
      next: () => {
        job.status = 'Closed';
      },
    });
  }

  onReopen(job: Job): void {
    if (job.status !== 'Closed') {
      return;
    }

    this.jobService.reopenJob(job.id).subscribe({
      next: () => {
        job.status = 'Active';
      },
    });
  }

  onDelete(job: Job): void {
    this.pendingDeleteJob = job;
    this.isDeleteDialogOpen = true;
  }

  confirmDelete(): void {
    if (!this.pendingDeleteJob || this.isDeleting) {
      return;
    }

    const deletingJob = this.pendingDeleteJob;
    this.isDeleting = true;

    this.jobService.deleteJob(deletingJob.id).subscribe({
      next: () => {
        this.jobs = this.jobs.filter((item) => item.id !== deletingJob.id);
        if (this.selectedJob?.id === deletingJob.id) {
          this.closeJobPreview();
        }
        this.closeDeleteDialog();
      },
      error: () => {
        this.isDeleting = false;
      },
    });
  }

  closeDeleteDialog(): void {
    this.isDeleteDialogOpen = false;
    this.pendingDeleteJob = null;
    this.isDeleting = false;
  }

  closeDeleteDialogFromBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget && !this.isDeleting) {
      this.closeDeleteDialog();
    }
  }

  closeJobPreview(): void {
    this.isPreviewOpen = false;
    this.selectedJob = null;
    if (this.isDeleteDialogOpen) {
      this.closeDeleteDialog();
    }
  }

  openJobPreview(job: Job): void {
    if (job.status === 'Closed') {
      return;
    }
    this.selectedJob = job;
    this.isPreviewOpen = true;
  }

  private extractJobs(response: MyJobDto[] | { data?: MyJobDto[]; items?: MyJobDto[]; result?: MyJobDto[] }): MyJobDto[] {
    if (Array.isArray(response)) {
      return response;
    }

    return response.data ?? response.items ?? response.result ?? [];
  }

  private mapApiJobToUi(job: MyJobDto): Job {
    const salaryMin = this.toNumber(this.readField<number | null>(job, 'salaryMin', 'SalaryMin'));
    const salaryMax = this.toNumber(this.readField<number | null>(job, 'salaryMax', 'SalaryMax'));
    const companyName = this.readField<string>(job, 'companyName', 'CompanyName')?.trim() || 'Your Company';
    const companyLogo = this.toAbsoluteUrl(this.readField<string>(job, 'companyLogo', 'CompanyLogo'));
    const companyDescription = this.readField<string>(job, 'companyDescription', 'CompanyDescription') || '';

    return {
      id: this.readField<number>(job, 'id', 'Id') || 0,
      title: this.readField<string>(job, 'title', 'Title') || 'Untitled Role',
      company: companyName,
      companyLogo,
      companyDescription,
      companyInitials: this.getInitials(companyName),
      location: this.readField<string>(job, 'location', 'Location') || 'Remote',
      type: this.readField<string>(job, 'jobType', 'JobType') || 'N/A',
      salary: this.formatSalary(salaryMin, salaryMax),
      postedDate: this.formatDate(this.readField<string>(job, 'createdAt', 'CreatedAt')),
      status: this.resolveStatus(job),
      applicants: this.toNumber(
        this.readField<number>(job, 'applicantsCount', 'ApplicantsCount') ?? this.readField<number>(job, 'applicants', 'Applicants'),
      ),
      views: this.toNumber(this.readField<number>(job, 'viewsCount', 'ViewsCount') ?? this.readField<number>(job, 'views', 'Views')),
      shortlisted: this.toNumber(
        this.readField<number>(job, 'shortlistedCount', 'ShortlistedCount') ?? this.readField<number>(job, 'shortlisted', 'Shortlisted'),
      ),
      description: this.readField<string>(job, 'description', 'Description') || 'No description provided.',
      skills: this.normalizeSkills(job),
    };
  }

  private normalizeSkills(job: MyJobDto): string[] {
    const source =
      this.readField<Array<string | { id?: number; name?: string; label?: string; skillName?: string }>>(job, 'requiredSkills', 'RequiredSkills') ??
      this.readField<Array<string | { id?: number; name?: string; label?: string; skillName?: string }>>(job, 'skills', 'Skills') ??
      [];

    return source
      .map((value) => {
        if (typeof value === 'string') {
          return value;
        }
        return value?.name || value?.label || value?.skillName || '';
      })
      .filter((value) => !!value);
  }

  private resolveStatus(job: MyJobDto): 'Active' | 'Closed' {
    const isClosed = this.readField<boolean>(job, 'isClosed', 'IsClosed');
    if (typeof isClosed === 'boolean') {
      return isClosed ? 'Closed' : 'Active';
    }

    const normalized = this.readField<string>(job, 'status', 'Status')?.toLowerCase();
    if (normalized === 'closed' || normalized === 'inactive') {
      return 'Closed';
    }

    return 'Active';
  }

  private formatDate(dateValue?: string): string {
    if (!dateValue) {
      return '-';
    }

    const parsed = new Date(dateValue);
    if (Number.isNaN(parsed.getTime())) {
      return '-';
    }

    return parsed.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  private formatSalary(min: number, max: number): string {
    if (!min && !max) {
      return 'Not disclosed';
    }

    const formatter = new Intl.NumberFormat('en-IN');
    if (min && max) {
      return `INR ${formatter.format(min)} - ${formatter.format(max)}`;
    }

    if (min) {
      return `INR ${formatter.format(min)}+`;
    }

    return `Up to INR ${formatter.format(max)}`;
  }

  private toNumber(value?: number | null): number {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      return 0;
    }
    return value;
  }

  private getInitials(name: string): string {
    const words = name.split(' ').filter(Boolean);
    return words
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join('');
  }

  private readField<T>(source: unknown, camelKey: string, pascalKey: string): T | undefined {
    const item = source as Record<string, unknown>;
    const camelValue = item[camelKey] as T | undefined;
    if (camelValue !== undefined && camelValue !== null) {
      return camelValue;
    }
    return item[pascalKey] as T | undefined;
  }

  toHtml(text?: string): string {
    return this.markdownService.parse(text || '');
  }

  private toAbsoluteUrl(url?: string): string {
    if (!url) {
      return '';
    }

    const trimmed = url.trim();
    if (!trimmed) {
      return '';
    }

    if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('data:')) {
      return trimmed;
    }

    const base = (environment.url || '').replace(/\/$/, '');
    if (!base) {
      return trimmed;
    }

    if (trimmed.startsWith('/')) {
      return `${base}${trimmed}`;
    }

    return `${base}/${trimmed}`;
  }
}

export { PostedJobHome as PostedJobHomeComponent };
