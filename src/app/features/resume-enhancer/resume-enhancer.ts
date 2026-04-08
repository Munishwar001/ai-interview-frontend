import { Component, OnInit } from '@angular/core';
import { CommonModule, NgTemplateOutlet } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from '../../../../environment/environment';
import { JobSeekerService } from '../profiles/user-profile/services/job-seeker.service';
import { FileActionsService } from '../../shared/services/file-actions';
import { ResumeEnhancerService } from './resume-enhancer.service';
import { AppDatePipe } from '../../shared/pipes/app-date.pipe';

type ViewState = 'idle' | 'loading' | 'results';

interface ResumeAnalysis {
  overallScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  missingKeywords: string[];
  formattingFeedback: string;
  atsCompatibility: {
    score: number;
    issues: string[];
  };
}

@Component({
  selector: 'app-resume-enhancer',
  standalone: true,
  imports: [CommonModule, NgTemplateOutlet, AppDatePipe],
  templateUrl: './resume-enhancer.html',
  styleUrl: './resume-enhancer.scss',
})
export class ResumeEnhancer implements OnInit {
  viewState: ViewState = 'idle';
  isResumeStatusLoading = false;
  isUploadingResume = false;
  isAnalysisLoading = false;
  hasUploadedResume = false;
  resumeFileName: string | null = null;
  resumeFilePath: string | null = null;
  resumeIframeUrl: SafeResourceUrl | null = null;
  uploadError = '';
  analysisError = '';
  hasAnalysis = false;
  analysisMeta: {
    id: string;
    createdAt: string;
    updatedAt: string;
  } = {
    id: '',
    createdAt: '',
    updatedAt: '',
  };

  resumeData = {
    name: 'Your Name',
    title: 'Your Role',
    location: 'Your Location',
    email: 'your.email@example.com',
    summary: 'Upload and analyze your resume to see AI-enhanced suggestions.',
    experience: ['Your experience bullets will appear here after analysis.'],
  };

  analysis: ResumeAnalysis = {
    overallScore: 0,
    summary: '',
    strengths: [],
    weaknesses: [],
    suggestions: [],
    missingKeywords: [],
    formattingFeedback: '',
    atsCompatibility: {
      score: 0,
      issues: [],
    },
  };

  constructor(
    private jobSeekerService: JobSeekerService,
    private sanitizer: DomSanitizer,
    private fileActions: FileActionsService,
    private resumeEnhancerService: ResumeEnhancerService,
  ) {}

  ngOnInit(): void {
    this.loadResumeStatus();
  }

  loadResumeStatus(): void {
    this.isResumeStatusLoading = true;
    this.uploadError = '';

    this.jobSeekerService.getResumeStatus().subscribe({
      next: (status) => {
        this.hasUploadedResume = status.isUploaded;
        this.resumeFileName = status.fileName;
        this.resumeFilePath = status.filePath;
        this.resumeIframeUrl = status.filePath
          ? this.sanitizer.bypassSecurityTrustResourceUrl(this.toAbsoluteUrl(status.filePath))
          : null;
        this.isResumeStatusLoading = false;

        if (status.isUploaded) {
          this.loadCachedAnalysis();
        }
      },
      error: () => {
        this.hasUploadedResume = false;
        this.resumeFileName = null;
        this.resumeFilePath = null;
        this.resumeIframeUrl = null;
        this.uploadError = 'Unable to fetch resume status. Please try again.';
        this.isResumeStatusLoading = false;
      },
    });
  }

  onResumeSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    this.uploadError = '';
    this.isUploadingResume = true;

    this.jobSeekerService.uploadResume(file).subscribe({
      next: () => {
        this.isUploadingResume = false;
        this.analysisError = '';
        this.viewState = 'idle';
        this.loadResumeStatus();
      },
      error: (err) => {
        this.isUploadingResume = false;
        this.uploadError = err?.error?.message || 'Resume upload failed. Please try again.';
      },
    });

    input.value = '';
  }

  triggerResumeUpload(input: HTMLInputElement): void {
    if (this.isUploadingResume) {
      return;
    }
    input.click();
  }

  startAnalysis(): void {
    if (!this.hasUploadedResume) {
      this.analysisError = 'Upload your resume first, then run AI analysis.';
      return;
    }

    this.analysisError = '';
    this.viewState = 'loading';
    this.isAnalysisLoading = true;

    this.resumeEnhancerService.analyzeFromProfile().subscribe({
      next: (result) => {
        this.applyApiResult(result);
        this.hasAnalysis = true;
        this.analysisError = '';
        this.viewState = 'results';
        this.isAnalysisLoading = false;
      },
      error: (err) => {
        this.analysisError = err?.error?.message || 'AI analysis failed. Please try again.';
        this.viewState = 'idle';
        this.isAnalysisLoading = false;
      },
    });
  }

  private loadCachedAnalysis(): void {
    this.resumeEnhancerService.getResult().subscribe({
      next: (result) => {
        this.applyApiResult(result);
        this.hasAnalysis = true;
        this.viewState = 'results';
      },
      error: () => {
        // No cached result yet.
      },
    });
  }

  private applyApiResult(result: unknown): void {
    const aiResponse = (this.readPath(result, 'aiResponse') as Record<string, unknown>) || (result as Record<string, unknown>) || {};

    this.analysis.overallScore = this.pickNumber(aiResponse, ['overallScore']);
    this.analysis.summary = this.pickString(aiResponse, ['summary']);
    this.analysis.strengths = this.pickArrayOfStrings(aiResponse, ['strengths']);
    this.analysis.weaknesses = this.pickArrayOfStrings(aiResponse, ['weaknesses']);
    this.analysis.suggestions = this.pickArrayOfStrings(aiResponse, ['suggestions']);
    this.analysis.missingKeywords = this.pickArrayOfStrings(aiResponse, ['missingKeywords']);
    this.analysis.formattingFeedback = this.pickString(aiResponse, ['formattingFeedback']);

    const ats = this.readPath(aiResponse, 'atsCompatibility') as Record<string, unknown> | undefined;
    this.analysis.atsCompatibility.score = this.pickNumber(ats, ['score']);
    this.analysis.atsCompatibility.issues = this.pickArrayOfStrings(ats, ['issues']);

    this.analysisMeta.id = this.pickString(result, ['id']);
    this.analysisMeta.createdAt = this.pickString(result, ['createdAt']);
    this.analysisMeta.updatedAt = this.pickString(result, ['updatedAt']);

    this.hasAnalysis =
      this.analysis.overallScore > 0 ||
      this.analysis.atsCompatibility.score > 0 ||
      this.analysis.summary.length > 0 ||
      this.analysis.strengths.length > 0 ||
      this.analysis.weaknesses.length > 0 ||
      this.analysis.suggestions.length > 0;
  }

  private pickString(source: unknown, paths: string[]): string {
    for (const path of paths) {
      const value = this.readPath(source, path);
      if (typeof value === 'string' && value.trim()) {
        return value.trim();
      }
    }
    return '';
  }

  private pickArray(source: unknown, paths: string[]): unknown[] {
    for (const path of paths) {
      const value = this.readPath(source, path);
      if (Array.isArray(value)) {
        return value;
      }
    }
    return [];
  }

  private pickArrayOfStrings(source: unknown, paths: string[]): string[] {
    return this.pickArray(source, paths)
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter((item) => !!item);
  }

  private pickNumber(source: unknown, paths: string[]): number {
    for (const path of paths) {
      const value = this.readPath(source, path);
      if (typeof value === 'number' && !Number.isNaN(value)) {
        return value;
      }
      if (typeof value === 'string' && value.trim()) {
        const parsed = Number(value);
        if (!Number.isNaN(parsed)) {
          return parsed;
        }
      }
    }
    return 0;
  }

  private readPath(source: unknown, path: string): unknown {
    const keys = path.split('.');
    let current: unknown = source;

    for (const key of keys) {
      if (!current || typeof current !== 'object') {
        return undefined;
      }
      current = (current as Record<string, unknown>)[key];
    }

    return current;
  }

  resetView(): void {
    this.viewState = 'idle';
    this.analysisError = '';
  }

  downloadPDF(): void {
    if (!this.resumeFilePath) {
      return;
    }

    this.fileActions.downloadFromUrl(this.resumeFilePath, this.resumeFileName || 'resume');
  }

  private toAbsoluteUrl(fileUrl: string): string {
    if (/^(https?:|blob:|data:)/i.test(fileUrl)) {
      return fileUrl;
    }

    const base = environment.url.replace(/\/$/, '');
    if (fileUrl.startsWith('/')) {
      return `${base}${fileUrl}`;
    }

    return `${base}/${fileUrl}`;
  }
}