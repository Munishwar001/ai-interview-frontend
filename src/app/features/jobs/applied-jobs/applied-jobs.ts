import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { JobsService } from '../services/jobs.service';
import { Icons } from '../../../shared/icons/icons';

export interface AppliedJob {
  applicationId: number;
  jobId: number;
  title: string;
  companyName: string;
  companyLogo?: string;
  location: string;
  jobType: string;
  appliedAt: string;
  status: string;
  coverLetter?: string;
}

@Component({
  selector: 'app-applied-jobs',
  standalone: true,
  imports: [CommonModule, RouterLink, Icons],
  templateUrl: './applied-jobs.html',
})
export class AppliedJobs implements OnInit {
  jobs = signal<AppliedJob[]>([]);
  isLoading = signal(true);
  withdrawingId: number | null = null;
  brokenLogoIds = new Set<number>();

  constructor(private svc: JobsService, private toastr: ToastrService) {}

  ngOnInit() { this.load(); }

  load() {
    this.isLoading.set(true);
    this.svc.getMyApplications().subscribe({
      next: (data) => { this.jobs.set(data); this.isLoading.set(false); },
      error: () => { this.isLoading.set(false); },
    });
  }

  withdraw(applicationId: number) {
    this.withdrawingId = applicationId;
    this.svc.withdraw(applicationId).subscribe({
      next: () => {
        this.jobs.update(list => list.filter(j => j.applicationId !== applicationId));
        this.toastr.success('Application withdrawn.');
        this.withdrawingId = null;
      },
      error: () => {
        this.toastr.error('Failed to withdraw application.');
        this.withdrawingId = null;
      },
    });
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
    return this.jobs().filter(j => j.status?.toLowerCase() === status.toLowerCase()).length;
  }

  onLogoError(applicationId: number, event: Event) {
    this.brokenLogoIds.add(applicationId);
    const img = event.target as HTMLImageElement;
    img.src = '';
  }
}
