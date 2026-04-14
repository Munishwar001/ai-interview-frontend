import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../../environment/environment';

export interface JobListItem {
  jobId: number;
  companyId?: number;
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
  companyId?: number;
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
  userId?: string;
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

export interface ApplicationChatRoomDto {
  applicationId: number;
  participantName: string;
  participantEmail?: string;
  participantAvatar?: string;
  jobTitle: string;
  status: string;
  lastMessage?: string;
  lastMessageAt?: string;
}

export interface ApplicationChatMessageDto {
  id: number;
  applicationId: number;
  senderId: string;
  senderName: string;
  message: string;
  createdAt: string;
}

interface BackendApplicationChatRoom {
  applicationId?: number;
  participantName?: string;
  userName?: string;
  participantEmail?: string;
  email?: string;
  participantAvatar?: string;
  avatar?: string;
  jobTitle?: string;
  title?: string;
  status?: string;
  lastMessage?: string;
  latestMessage?: string;
  lastMessageAt?: string;
  latestMessageAt?: string;
}

interface BackendApplicationChatMessage {
  id?: number;
  messageId?: number;
  applicationId?: number;
  senderId?: string;
  userId?: string;
  senderName?: string;
  name?: string;
  message?: string;
  text?: string;
  createdAt?: string;
  sentAt?: string;
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

  getLatestJobs(limit: number = 3): Observable<JobListItem[]> {
    const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 3;
    const params = new HttpParams().set('limit', safeLimit.toString());
    return this.http
      .get<BackendJob[]>(`${this.base}/jobs/latest`, { params })
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

  getChatRooms(): Observable<ApplicationChatRoomDto[]> {
    return this.http
      .get<BackendApplicationChatRoom[]>(`${this.base}/chat/rooms`)
      .pipe(map((rooms) => rooms.map((room) => this.toApplicationChatRoom(room))));
  }

  getChatMessages(applicationId: number): Observable<ApplicationChatMessageDto[]> {
    return this.http
      .get<BackendApplicationChatMessage[]>(`${this.base}/${applicationId}/chat/messages`)
      .pipe(map((messages) => messages.map((message) => this.toApplicationChatMessage(message))));
  }

  sendChatMessage(applicationId: number, message: string): Observable<ApplicationChatMessageDto> {
    return this.http
      .post<BackendApplicationChatMessage>(`${this.base}/${applicationId}/chat/messages`, { message })
      .pipe(map((created) => this.toApplicationChatMessage(created)));
  }

  private toJobListItem(job: BackendJob): JobListItem {
    return {
      jobId: job.jobId ?? job.id ?? 0,
      companyId: job.companyId,
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
      userId: app.userId,
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

  private toApplicationChatRoom(room: BackendApplicationChatRoom): ApplicationChatRoomDto {
    return {
      applicationId: room.applicationId ?? 0,
      participantName: room.participantName ?? room.userName ?? 'Unknown User',
      participantEmail: room.participantEmail ?? room.email,
      participantAvatar: this.toAbsoluteUrl(room.participantAvatar ?? room.avatar),
      jobTitle: room.jobTitle ?? room.title ?? '',
      status: room.status ?? 'Shortlisted',
      lastMessage: room.lastMessage ?? room.latestMessage,
      lastMessageAt: room.lastMessageAt ?? room.latestMessageAt,
    };
  }

  private toApplicationChatMessage(message: BackendApplicationChatMessage): ApplicationChatMessageDto {
    return {
      id: message.id ?? message.messageId ?? 0,
      applicationId: message.applicationId ?? 0,
      senderId: message.senderId ?? message.userId ?? '',
      senderName: message.senderName ?? message.name ?? 'User',
      message: message.message ?? message.text ?? '',
      createdAt: message.createdAt ?? message.sentAt ?? new Date().toISOString(),
    };
  }
}
