import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { forkJoin, map, of } from 'rxjs';
import { Icons } from '../../../shared/icons/icons';
import { JobsService, InterviewDto } from '../services/jobs.service';
import { JobService, MyJobDto } from '../../post-job/services/post-job';
import { UserStore } from '../../../core/services/user-store';

interface InterviewViewModel extends InterviewDto {
  displayId: number;
  displayJobTitle: string;
}

@Component({
  selector: 'app-interviews',
  standalone: true,
  imports: [CommonModule, RouterLink, Icons],
  templateUrl: './interviews.html',
  styleUrl: './interviews.scss'
})
export class Interviews implements OnInit {
  interviews = signal<InterviewViewModel[]>([]);
  isLoading = signal(true);
  isEmployer = false;
  isNavigating = false;
  private readonly appIcon = Icons;

  constructor(
    private jobsService: JobsService,
    private jobService: JobService,
    private userStore: UserStore,
    private router: Router
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.isLoading.set(true);
    this.isEmployer = this.userStore.state.isEmployerAccess;

    if (this.isEmployer) {
      this.jobService.getMyJobs().subscribe({
        next: (response) => {
          const jobs = this.extractJobs(response);
          if (!jobs.length) {
            this.interviews.set([]);
            this.isLoading.set(false);
            return;
          }

          forkJoin(jobs.map((job) => this.jobsService.getInterviewsByJob(job.id).pipe(
            map((items) => items.map((interview) => ({
              ...interview,
              displayId: Number(interview.interviewId ?? interview.id ?? 0),
              displayJobTitle: this.readJobField<string>(job, 'title', 'Title') || 'Untitled Job',
            })))
          ))).subscribe({
            next: (groups) => {
              const merged = groups.flat().filter((x) => x.displayId > 0);
              this.interviews.set(merged.sort((a, b) => this.toMillis(b.scheduledAt) - this.toMillis(a.scheduledAt)));
              this.isLoading.set(false);
            },
            error: () => {
              this.interviews.set([]);
              this.isLoading.set(false);
            },
          });
        },
        error: () => {
          this.interviews.set([]);
          this.isLoading.set(false);
        },
      });
      return;
    }

    this.jobsService.getMyInterviews().subscribe({
      next: (items) => {
        const mapped = items.map((interview) => ({
          ...interview,
          displayId: Number(interview.interviewId ?? interview.id ?? 0),
          displayJobTitle: String(interview['jobTitle'] || 'Scheduled Interview'),
        }));
        this.interviews.set(mapped.filter((x) => x.displayId > 0).sort((a, b) => this.toMillis(b.scheduledAt) - this.toMillis(a.scheduledAt)));
        this.isLoading.set(false);
      },
      error: () => {
        this.interviews.set([]);
        this.isLoading.set(false);
      },
    });
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

  private toMillis(value?: string): number {
    if (!value) return 0;
    const dt = new Date(value);
    return Number.isNaN(dt.getTime()) ? 0 : dt.getTime();
  }
}
