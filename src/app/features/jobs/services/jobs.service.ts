import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../../environment/environment';

export interface JobListItem {
  jobId: number;
  title: string;
  companyName: string;
  companyLogo?: string;
  location: string;
  jobType: string;
  salaryMin?: number;
  salaryMax?: number;
  postedDate: string;
  skills: string[];
  description?: string;
}

interface BackendSkill {
  id?: number;
  name?: string;
}

interface BackendJob {
  id?: number;
  jobId?: number;
  title?: string;
  companyName?: string;
  companyLogo?: string;
  location?: string;
  jobType?: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  createdAt?: string;
  postedDate?: string;
  skills?: Array<BackendSkill | string>;
  description?: string;
}

export interface ApplicantDto {
  applicationId: number;
  applicantName: string;
  applicantEmail: string;
  avatar?: string;
  appliedAt: string;
  status: string;
  coverLetter?: string;
  resumeFileName?: string;
  resumeFilePath?: string;
}

interface BackendApplicant {
  id?: number;
  applicationId?: number;
  userId?: string;
  name?: string;
  applicantName?: string;
  email?: string;
  applicantEmail?: string;
  avatar?: string;
  resumeFileName?: string;
  resumeFilePath?: string;
  coverLetter?: string;
  status?: string;
  appliedAt?: string;
}

export interface ApplyJobDto {
  coverLetter?: string;
}

export interface ScheduleVideoInterviewDto {
  scheduledAt: string;
  notes?: string;
}

export interface InterviewDto {
  id?: number;
  interviewId?: number;
  applicationId?: number;
  jobId?: number;
  scheduledAt?: string;
  notes?: string;
  status?: string;
  meetingUrl?: string;
  joinUrl?: string;
  roomUrl?: string;
  [key: string]: unknown;
}

@Injectable({ providedIn: 'root' })
export class JobsService {
  private readonly base = `${environment.apiUrl}/applications`;

  constructor(private http: HttpClient) {}

  getJobs(search?: string, location?: string, jobTypeId?: number): Observable<JobListItem[]> {
    let params = new HttpParams();
    if (search)    params = params.set('search', search);
    if (location)  params = params.set('location', location);
    if (jobTypeId) params = params.set('jobTypeId', jobTypeId);
    return this.http
      .get<BackendJob[]>(`${this.base}/jobs`, { params })
      .pipe(map((jobs) => jobs.map((job) => this.toJobListItem(job))));
  }

  getJob(jobId: number): Observable<JobListItem> {
    return this.http
      .get<BackendJob>(`${this.base}/jobs/${jobId}`)
      .pipe(map((job) => this.toJobListItem(job)));
  }

  getRecommended(): Observable<JobListItem[]> {
    return this.http
      .get<BackendJob[]>(`${this.base}/jobs/recommended`)
      .pipe(map((jobs) => jobs.map((job) => this.toJobListItem(job))));
  }

  apply(jobId: number, coverLetter?: string): Observable<{ applicationId: number }> {
    return this.http.post<{ applicationId: number }>(
      `${this.base}/jobs/${jobId}/apply`,
      { coverLetter } as ApplyJobDto
    );
  }

  hasApplied(jobId: number): Observable<{ hasApplied: boolean }> {
    return this.http.get<{ hasApplied: boolean }>(`${this.base}/jobs/${jobId}/has-applied`);
  }

  getMyApplications(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/my`);
  }

  withdraw(applicationId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${applicationId}`);
  }

  getApplicants(jobId: number): Observable<ApplicantDto[]> {
    return this.http
      .get<BackendApplicant[]>(`${this.base}/jobs/${jobId}/applicants`)
      .pipe(map((apps) => apps.map((app) => this.toApplicantDto(app))));
  }

  updateStatus(applicationId: number, status: string): Observable<void> {
    return this.http.patch<void>(`${this.base}/${applicationId}/status`, { status });
  }

  scheduleInterview(applicationId: number, payload: ScheduleVideoInterviewDto): Observable<InterviewDto> {
    return this.http.post<InterviewDto>(`${this.base}/${applicationId}/interviews`, payload);
  }

  getInterviewsByJob(jobId: number): Observable<InterviewDto[]> {
    return this.http.get<InterviewDto[]>(`${this.base}/jobs/${jobId}/interviews`);
  }

  getMyInterviews(): Observable<InterviewDto[]> {
    return this.http.get<InterviewDto[]>(`${this.base}/my/interviews`);
  }

  getInterview(interviewId: number): Observable<InterviewDto> {
    return this.http.get<InterviewDto>(`${this.base}/interviews/${interviewId}`);
  }

  private toJobListItem(job: BackendJob): JobListItem {
    return {
      jobId: job.jobId ?? job.id ?? 0,
      title: job.title ?? '',
      companyName: job.companyName ?? '',
      companyLogo: this.toAbsoluteUrl(job.companyLogo),
      location: job.location ?? '',
      jobType: job.jobType ?? '',
      salaryMin: job.salaryMin ?? undefined,
      salaryMax: job.salaryMax ?? undefined,
      postedDate: job.postedDate ?? job.createdAt ?? '',
      skills: this.toSkillNames(job.skills),
      description: job.description,
    };
  }

  private toSkillNames(skills?: Array<BackendSkill | string>): string[] {
    if (!skills?.length) return [];

    return skills
      .map((skill) => typeof skill === 'string' ? skill : skill?.name ?? '')
      .map((name) => name.trim())
      .filter(Boolean);
  }

  private toApplicantDto(app: BackendApplicant): ApplicantDto {
    return {
      applicationId: app.applicationId ?? app.id ?? 0,
      applicantName: app.applicantName ?? app.name ?? 'Unknown Applicant',
      applicantEmail: app.applicantEmail ?? app.email ?? '',
      avatar: this.toAbsoluteUrl(app.avatar),
      appliedAt: app.appliedAt ?? '',
      status: app.status ?? 'Pending',
      coverLetter: app.coverLetter,
      resumeFileName: app.resumeFileName,
      resumeFilePath: app.resumeFilePath,
    };
  }

  private toAbsoluteUrl(path?: string): string | undefined {
    if (!path) return undefined;
    if (path.startsWith('http')) return path;
    const base = (environment.url || '').replace(/\/$/, '');
    return `${base}${path}`;
  }
}
