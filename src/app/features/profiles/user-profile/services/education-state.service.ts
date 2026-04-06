import { Injectable, signal, WritableSignal } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Education, UserProfileData, AddEducationDto } from '../../profiles.models';
import { JobSeekerService } from './job-seeker.service';

@Injectable()
export class EducationStateService {
  readonly showModal = signal(false);
  readonly editingId = signal<string | null>(null);
  touched = false;

  newEducation: Partial<Education> = this.blank();
  startYearInput = '';
  endYearInput = '';

  constructor(private svc: JobSeekerService, private toastr: ToastrService) {}

  blank(): Partial<Education> {
    return { degree: '', institution: '', fieldOfStudy: '', startYear: undefined as any, endYear: undefined, isCurrent: false, description: '' };
  }

  err(field: 'degree' | 'institution' | 'startYear' | 'endYear'): string {
    if (!this.touched) return '';
    if (field === 'degree' && !this.newEducation.degree?.trim()) return 'Degree is required.';
    if (field === 'institution' && !this.newEducation.institution?.trim()) return 'Institution is required.';
    if (field === 'startYear' && !this.toYear(this.startYearInput)) return 'Start year is required.';
    if (field === 'endYear' && !this.newEducation.isCurrent && !this.toYear(this.endYearInput)) return 'End year is required.';
    return '';
  }

  load(profile: WritableSignal<UserProfileData>) {
    this.svc.getEducation().subscribe({
      next: (res) => profile.update(p => ({
        ...p,
        education: res.map(e => ({
          id: String(e.id), degree: e.degree, institution: e.institution,
          fieldOfStudy: e.fieldOfStudy, startYear: e.startYear,
          endYear: e.endYear, isCurrent: e.isCurrent, description: e.description,
        })),
      })),
      error: (err) => console.error('Failed to load education', err),
    });
  }

  openAdd() {
    this.newEducation = this.blank();
    this.startYearInput = '';
    this.endYearInput = '';
    this.touched = false;
    this.showModal.set(true);
  }

  openEdit(edu: Education) {
    this.newEducation = { ...edu };
    this.startYearInput = edu.startYear ? `${edu.startYear}-01-01` : '';
    this.endYearInput = edu.endYear ? `${edu.endYear}-01-01` : '';
    this.touched = false;
    this.editingId.set(edu.id);
    this.showModal.set(true);
  }

  cancel() {
    this.editingId.set(null);
    this.touched = false;
    this.showModal.set(false);
    this.startYearInput = '';
    this.endYearInput = '';
  }

  save(profile: WritableSignal<UserProfileData>) {
    const dto = this.buildDto();
    if (!dto) return;
    this.svc.addEducation(dto).subscribe({
      next: (res) => {
        profile.update(p => ({ ...p, education: [...p.education, { ...dto, id: String(res.id) }] }));
        this.showModal.set(false);
        this.toastr.success('Education added!');
      },
      error: () => this.toastr.error('Failed to add education.'),
    });
  }

  update(profile: WritableSignal<UserProfileData>) {
    const id = this.editingId()!;
    const dto = this.buildDto();
    if (!dto) return;
    this.svc.updateEducation(Number(id), dto).subscribe({
      next: () => {
        profile.update(p => ({ ...p, education: p.education.map(e => e.id === id ? { ...dto, id } : e) }));
        this.editingId.set(null);
        this.showModal.set(false);
        this.toastr.success('Education updated!');
      },
      error: () => this.toastr.error('Failed to update education.'),
    });
  }

  delete(id: string, profile: WritableSignal<UserProfileData>) {
    this.svc.deleteEducation(Number(id)).subscribe({
      next: () => {
        profile.update(p => ({ ...p, education: p.education.filter(e => e.id !== id) }));
        this.toastr.success('Education deleted.');
      },
      error: () => this.toastr.error('Failed to delete education.'),
    });
  }

  private buildDto(): AddEducationDto | null {
    this.touched = true;
    const startYear = this.toYear(this.startYearInput);
    const endYear = this.newEducation.isCurrent ? undefined : this.toYear(this.endYearInput);
    if (!startYear) { this.toastr.error('Please select a start year.'); return null; }
    if (!this.newEducation.isCurrent && !endYear) { this.toastr.error('Please select an end year.'); return null; }
    if (endYear && endYear < startYear) { this.toastr.error('End year cannot be before start year.'); return null; }
    return {
      degree: this.newEducation.degree ?? '', institution: this.newEducation.institution ?? '',
      fieldOfStudy: this.newEducation.fieldOfStudy ?? '', startYear,
      endYear, isCurrent: this.newEducation.isCurrent ?? false,
      description: this.newEducation.description ?? '',
    };
  }

  private toYear(val?: string): number | undefined {
    if (!val) return undefined;
    const y = Number(val.slice(0, 4));
    return Number.isFinite(y) ? y : undefined;
  }
}
