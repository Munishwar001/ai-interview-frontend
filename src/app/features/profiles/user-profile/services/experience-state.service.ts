import { Injectable, signal } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Experience, UserProfileData, AddExperienceDto } from '../../profiles.models';
import { JobSeekerService } from './job-seeker.service';
import { WritableSignal } from '@angular/core';

@Injectable()
export class ExperienceStateService {
  readonly showModal = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly showMapPicker = signal(false);
  touched = false;

  newExperience: Partial<Experience> = this.blank();

  constructor(private svc: JobSeekerService, private toastr: ToastrService) {}

  blank(): Partial<Experience> {
    return { title: '', company: '', location: '', startDate: '', endDate: '', current: false, description: '' };
  }

  validate(): boolean {
    this.touched = true;
    const e = this.newExperience;
    if (!e.title?.trim()) return false;
    if (!e.company?.trim()) return false;
    if (!e.startDate) return false;
    if (!e.current && !e.endDate) return false;
    return true;
  }

  err(field: 'title' | 'company' | 'startDate' | 'endDate'): string {
    if (!this.touched) return '';
    const e = this.newExperience;
    if (field === 'title' && !e.title?.trim()) return 'Job title is required.';
    if (field === 'company' && !e.company?.trim()) return 'Company is required.';
    if (field === 'startDate' && !e.startDate) return 'Start date is required.';
    if (field === 'endDate' && !e.current && !e.endDate) return 'End date is required.';
    return '';
  }

  load(profile: WritableSignal<UserProfileData>) {
    this.svc.getExperiences().subscribe({
      next: (res) => profile.update(p => ({
        ...p,
        experience: res.map(e => ({
          id: String(e.id), title: e.jobTitle, company: e.company,
          location: e.location ?? '', startDate: e.startDate,
          endDate: e.endDate ?? '', current: e.isCurrent, description: e.description ?? '',
        })),
      })),
      error: (err) => console.error('Failed to load experiences', err),
    });
  }

  openAdd() { this.newExperience = this.blank(); this.touched = false; this.showModal.set(true); }

  openEdit(exp: Experience) {
    this.newExperience = { ...exp };
    this.touched = false;
    this.editingId.set(exp.id);
    this.showModal.set(true);
  }

  cancel() { this.editingId.set(null); this.touched = false; this.showModal.set(false); this.showMapPicker.set(false); }

  save(profile: WritableSignal<UserProfileData>) {
    if (!this.validate()) return;
    const dto = this.toDto(this.newExperience);
    this.svc.addExperience(dto).subscribe({
      next: (res) => {
        profile.update(p => ({
          ...p,
          experience: [...p.experience, {
            id: String(res.id), title: dto.jobTitle, company: dto.company,
            location: dto.location ?? '', startDate: this.newExperience.startDate ?? '',
            endDate: this.newExperience.endDate ?? '', current: dto.isCurrent,
            description: dto.description ?? '',
          }],
        }));
        this.showModal.set(false);
        this.toastr.success('Experience added!');
      },
      error: () => this.toastr.error('Failed to add experience.'),
    });
  }

  update(profile: WritableSignal<UserProfileData>) {
    if (!this.validate()) return;
    const id = this.editingId()!;
    const dto = this.toDto(this.newExperience);
    this.svc.updateExperience(Number(id), dto).subscribe({
      next: () => {
        profile.update(p => ({
          ...p,
          experience: p.experience.map(e => e.id === id ? {
            id, title: dto.jobTitle, company: dto.company,
            location: dto.location ?? '', startDate: this.newExperience.startDate ?? '',
            endDate: this.newExperience.endDate ?? '', current: dto.isCurrent,
            description: dto.description ?? '',
          } : e),
        }));
        this.editingId.set(null);
        this.showModal.set(false);
        this.toastr.success('Experience updated!');
      },
      error: () => this.toastr.error('Failed to update experience.'),
    });
  }

  delete(id: string, profile: WritableSignal<UserProfileData>) {
    this.svc.deleteExperience(Number(id)).subscribe({
      next: () => {
        profile.update(p => ({ ...p, experience: p.experience.filter(e => e.id !== id) }));
        this.toastr.success('Experience deleted.');
      },
      error: () => this.toastr.error('Failed to delete experience.'),
    });
  }

  private toDto(e: Partial<Experience>): AddExperienceDto {
    return {
      jobTitle: e.title ?? '', company: e.company ?? '', location: e.location ?? '',
      startDate: this.toDateOnly(e.startDate ?? ''),
      endDate: e.current ? undefined : this.toDateOnly(e.endDate ?? ''),
      isCurrent: e.current ?? false, description: e.description ?? '',
    };
  }

  private toDateOnly(val: string): string {
    if (!val) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
    const d = new Date(val);
    return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
  }
}
