import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../../../environment/environment';

export interface UserProfileDto {
  id: number;
  name?: string;
  title?: string;
  location?: string;
  email?: string;
  avatar?: string;
  initial?: string;
  profileCompletion: number;
  resumeFileName?: string;
  resumeFilePath?: string;
  linkedIn?: string;
  gitHub?: string;
  website?: string;
}

export interface UpsertUserProfileDto {
  name?: string;
  title?: string;
  location?: string;
  email?: string;
  avatar?: string;
  initial?: string;
  linkedIn?: string;
  gitHub?: string;
  website?: string;
}

export interface ExperienceDto {
  id: number;
  jobTitle: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description?: string;
}

export interface AddExperienceDto {
  jobTitle: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description?: string;
}

export interface EducationDto {
  id: number;
  degree: string;
  institution: string;
  fieldOfStudy?: string;
  startYear: number;
  endYear?: number;
  isCurrent: boolean;
  description?: string;
}

export interface AddEducationDto {
  degree: string;
  institution: string;
  fieldOfStudy?: string;
  startYear: number;
  endYear?: number;
  isCurrent: boolean;
  description?: string;
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
}
