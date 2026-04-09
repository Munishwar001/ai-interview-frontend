import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JobsService, JobListItem } from '../services/jobs.service';
import { ToastrService } from 'ngx-toastr';
import { LocationSearch } from '../../../shared/components/location-search/location-search';

@Component({
  selector: 'app-job-recommendations',
  standalone: true,
  imports: [CommonModule, FormsModule, LocationSearch],
  templateUrl: './job-recommendations.html',
})
export class JobRecommendations implements OnInit {
  jobs = signal<JobListItem[]>([]);
  isLoading = signal(true);
  activeTab: 'recommended' | 'all' = 'recommended';
  readonly pageSize = 6;
  currentPage = signal(1);

  search = '';
  location = '';
  applyingJobId: number | null = null;
  selectedJob: JobListItem | null = null;
  showApplyModal = false;
  coverLetter = '';
  appliedIds = new Set<number>();
  brokenLogoIds = new Set<number>();

  totalPages = computed(() => Math.ceil(this.jobs().length / this.pageSize));
  paginatedJobs = computed(() => {
    const page = this.currentPage();
    const start = (page - 1) * this.pageSize;
    return this.jobs().slice(start, start + this.pageSize);
  });
  pageStart = computed(() => {
    if (!this.jobs().length) return 0;
    return (this.currentPage() - 1) * this.pageSize + 1;
  });
  pageEnd = computed(() => Math.min(this.currentPage() * this.pageSize, this.jobs().length));
  pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);

    let start = Math.max(1, current - 2);
    let end = Math.min(total, start + 4);
    if (end - start < 4) start = Math.max(1, end - 4);

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  });

  constructor(private svc: JobsService, private toastr: ToastrService) {}

  ngOnInit() { this.loadRecommended(); }

  loadRecommended() {
    this.activeTab = 'recommended';
    this.isLoading.set(true);
    this.svc.getRecommended().subscribe({
      next: (jobs) => {
        this.jobs.set(jobs);
        this.currentPage.set(1);
        this.isLoading.set(false);
      },
      error: () => { this.isLoading.set(false); },
    });
  }

  searchJobs() {
    this.activeTab = 'all';
    this.isLoading.set(true);
    this.svc.getJobs(this.search || undefined, this.location || undefined).subscribe({
      next: (jobs) => {
        this.jobs.set(jobs);
        this.currentPage.set(1);
        this.isLoading.set(false);
      },
      error: () => { this.isLoading.set(false); },
    });
  }

  onLocationSelected(e: { address: string }) { this.location = e.address; }

  openApply(job: JobListItem) {
    this.selectedJob = job;
    this.coverLetter = '';
    this.showApplyModal = true;
  }

  submitApply() {
    if (!this.selectedJob) return;
    this.applyingJobId = this.selectedJob.jobId;
    this.svc.apply(this.selectedJob.jobId, this.coverLetter || undefined).subscribe({
      next: () => {
        this.appliedIds.add(this.selectedJob!.jobId);
        this.toastr.success('Application submitted!', 'Success');
        this.showApplyModal = false;
        this.applyingJobId = null;
      },
      error: (err) => {
        this.toastr.error(err?.error?.detail || 'Failed to apply.', 'Error');
        this.applyingJobId = null;
      },
    });
  }

  formatSalary(min?: number, max?: number): string {
    if (!min && !max) return '$ Not disclosed';
    if (min && max) return `$${min.toLocaleString('en-US')} – $${max.toLocaleString('en-US')}`;
    return min ? `From $${min.toLocaleString('en-US')}` : `Up to $${max!.toLocaleString('en-US')}`;
  }

  onLogoError(jobId: number, event: Event) {
    this.brokenLogoIds.add(jobId);
    const img = event.target as HTMLImageElement;
    img.src = '';
  }

  goToPage(page: number) {
    const total = this.totalPages();
    if (!total) return;
    this.currentPage.set(Math.min(Math.max(page, 1), total));
  }

  prevPage() {
    this.goToPage(this.currentPage() - 1);
  }

  nextPage() {
    this.goToPage(this.currentPage() + 1);
  }
}
