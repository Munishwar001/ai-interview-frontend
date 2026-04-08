import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../../../environment/environment';
import {UserProfileDto ,UpsertUserProfileDto ,ExperienceDto , AddExperienceDto ,
  EducationDto ,AddEducationDto ,UserSkillDto ,SyncSkillsDto} from './../../profiles.models'

export interface ResumeStatusResponse {
  isUploaded: boolean;
  fileName: string | null;
  filePath: string | null;
}

@Injectable({ providedIn: 'root' })
export class JobSeekerService {
  private readonly baseUrl = `${environment.apiUrl}/JobSeeker`;

  constructor(private http: HttpClient) {}

  getProfile(): Observable<UserProfileDto | null> {
    return this.http.get<UserProfileDto>(`${this.baseUrl}/profile`).pipe(
      catchError(err => {
        if (err.status === 404) return of(null);
        throw err;
      })
    );
  }

  upsertProfile(dto: UpsertUserProfileDto): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/profile`, dto);
  }

  uploadResume(file: File): Observable<{ success: boolean; fileName: string; filePath: string }> {
    const fd = new FormData();
    fd.append('resume', file, file.name);
    return this.http.post<{ success: boolean; fileName: string; filePath: string }>(
      `${this.baseUrl}/upload-resume`, fd
    );
  }

  getResumeStatus(): Observable<ResumeStatusResponse> {
    return this.http.get<ResumeStatusResponse>(`${this.baseUrl}/resume-status`);
  }

  downloadResume(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/download-resume`, { responseType: 'blob' });
  }

  deleteResume(): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/delete-resume`);
  }

  uploadAvatar(file: File): Observable<{ avatarPath: string }> {
    const fd = new FormData();
    fd.append('avatar', file, file.name);
    return this.http.post<{ avatarPath: string }>(`${this.baseUrl}/upload-avatar`, fd);
  }

  deleteAvatar(): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/delete-avatar`);
  }

  // ── Experience ─────────────────────────────────────────────────────────────
  getExperiences(): Observable<ExperienceDto[]> {
    return this.http.get<ExperienceDto[]>(`${this.baseUrl}/experience`);
  }

  addExperience(dto: AddExperienceDto): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(`${this.baseUrl}/experience`, dto);
  }

  updateExperience(id: number, dto: AddExperienceDto): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/experience/${id}`, dto);
  }

  deleteExperience(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/experience/${id}`);
  }

  // ── Education ──────────────────────────────────────────────────────────────
  getEducation(): Observable<EducationDto[]> {
    return this.http.get<EducationDto[]>(`${this.baseUrl}/education`);
  }

  addEducation(dto: AddEducationDto): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(`${this.baseUrl}/education`, dto);
  }

  updateEducation(id: number, dto: AddEducationDto): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/education/${id}`, dto);
  }

  deleteEducation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/education/${id}`);
  }

  // ── Skills ─────────────────────────────────────────────────────────────────
  getSkills(): Observable<UserSkillDto[]> {
    return this.http.get<UserSkillDto[]>(`${this.baseUrl}/skills`);
  }

  syncSkills(skillIds: number[]): Observable<{ success: boolean }> {
    const payload: SyncSkillsDto = { skillIds };
    return this.http.put<{ success: boolean }>(`${this.baseUrl}/skills`, payload);
  }
}
