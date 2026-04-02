import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LocationSearch } from '../../../shared/components/location-search/location-search';
import { DatePickerComponent } from '../../../shared/components/date-picker/date-picker';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { Experience, Education, UserProfileData } from '../profiles.models';
import { JobSeekerService, AddExperienceDto, AddEducationDto } from './services/job-seeker.service';
import { Lookup } from '../../../shared/services/lookup';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LocationSearch, DatePickerComponent, EmptyState],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.scss',
})
export class UserProfile implements OnInit {
  
  isEditingProfile = signal(false);
  isLoading = signal(true);
  isSaving = signal(false);
  isUploadingResume = signal(false);
  readonly currentYear = new Date().getFullYear();
  showAddExperience = signal(false);
  showAddEducation = signal(false);
  showMapPicker = signal(false);
  showExpMapPicker = signal(false);
  showEduMapPicker = signal(false);
  newSkill = signal('');
  editingExperienceId = signal<string | null>(null);
  editingEducationId = signal<string | null>(null);

  profile = signal<UserProfileData>({
    name: 'Admin',
    title: 'Senior Frontend Developer',
    location: 'San Francisco, CA',
    email: 'admin@necho.com',
    avatarInitial: 'A',
    profileCompletion: 75,
    socialLinks: {
      linkedin: 'https://linkedin.com',
      github: 'https://github.com',
      website: 'https://mysite.com',
    },
    resume: null,
    experience: [],
    education: [],
    skills: [],
  });

  profileForm!: FormGroup;

  constructor(private fb: FormBuilder, private jobSeekerService: JobSeekerService, private lookupService: Lookup, private toastr: ToastrService) {
    this.profileForm = this.buildProfileForm();
  }

  ngOnInit() {
    this.loadProfile();
    this.loadExperiences();
    this.loadEducation();
    this.loadSkills();
  }

  loadProfile() {
    this.isLoading.set(true);
    this.jobSeekerService.getProfile().subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res) {
          this.profile.update(p => ({
            ...p,
            name:           res.name          ?? p.name,
            title:          res.title         ?? p.title,
            location:       res.location      ?? p.location,
            email:          res.email         ?? p.email,
            avatarInitial:  res.initial       ?? (res.name?.charAt(0).toUpperCase() ?? p.avatarInitial),
            profileCompletion: res.profileCompletion ?? p.profileCompletion,
            resumeFileName: res.resumeFileName ?? p.resumeFileName,
            socialLinks: {
              linkedin: res.linkedIn  ?? p.socialLinks.linkedin,
              github:   res.gitHub    ?? p.socialLinks.github,
              website:  res.website   ?? p.socialLinks.website,
            },
          }));
        }
      },
      error: () => this.isLoading.set(false),
    });
  }

  /** Convenience getter for cleaner template access: f['name'], f['email'] etc. */
  get f() {
    return this.profileForm.controls;
  }

  private buildProfileForm(): FormGroup {
    const p = this.profile();
    return this.fb.group({
      name:     [p.name,     [Validators.required]],
      title:    [p.title],
      location: [p.location],
      email:    [p.email,    [Validators.required, Validators.email]],
      socialLinks: this.fb.group({
        linkedin: [p.socialLinks.linkedin ?? ''],
        github:   [p.socialLinks.github   ?? ''],
        website:  [p.socialLinks.website  ?? ''],
      }),
    });
  }

  completionColor = computed(() => {
    const pct = this.profile().profileCompletion;
    if (pct >= 80) return 'bg-emerald-500';
    if (pct >= 50) return 'bg-violet-500';
    return 'bg-amber-500';
  });

  resumeFileName = computed(() => this.profile().resumeFileName ?? this.profile().resume?.name ?? null);

  openEditProfile() {
    const p = this.profile();
    // Reset the form with the latest profile values each time the modal opens
    this.profileForm.reset({
      name:     p.name,
      title:    p.title,
      location: p.location,
      email:    p.email,
      socialLinks: {
        linkedin: p.socialLinks.linkedin ?? '',
        github:   p.socialLinks.github   ?? '',
        website:  p.socialLinks.website  ?? '',
      },
    });
    this.isEditingProfile.set(true);
  }

  saveProfile() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const val = this.profileForm.value;
    const dto = {
      name:     val.name,
      title:    val.title,
      location: val.location,
      email:    val.email,
      initial:  (val.name as string).charAt(0).toUpperCase(),
      linkedIn: val.socialLinks.linkedin || undefined,
      gitHub:   val.socialLinks.github   || undefined,
      website:  val.socialLinks.website  || undefined,
    };

    this.isSaving.set(true);
    this.jobSeekerService.upsertProfile(dto).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.profile.update(p => ({
          ...p,
          name:          dto.name,
          title:         dto.title,
          location:      dto.location,
          email:         dto.email,
          avatarInitial: dto.initial,
          socialLinks: {
            linkedin: dto.linkedIn,
            github:   dto.gitHub,
            website:  dto.website,
          },
        }));
        this.isEditingProfile.set(false);
        this.toastr.success('Profile saved!', 'Success');
      },
      error: () => {
        this.isSaving.set(false);
        this.toastr.error('Failed to save profile.', 'Error');
      },
    });
  }

  cancelEditProfile() {
    this.isEditingProfile.set(false);
    this.showMapPicker.set(false);
  }

  onLocationSelected(event: { address: string }) {
    this.profileForm.patchValue({ location: event.address });
    this.showMapPicker.set(false);
  }

  onExpLocationSelected(event: { address: string }) {
    this.newExperience.location = event.address;
    this.showExpMapPicker.set(false);
  }

  onEduLocationSelected(event: { address: string }) {
    this.showEduMapPicker.set(false);
  }

  onResumeSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    input.value = '';
    if (!file) return;

    this.isUploadingResume.set(true);
    this.jobSeekerService.uploadResume(file).subscribe({
      next: (res) => {
        this.isUploadingResume.set(false);
        this.profile.update(p => ({ ...p, resume: file, resumeFileName: res.fileName }));
        this.toastr.success('Resume uploaded!', 'Success');
      },
      error: () => {
        this.isUploadingResume.set(false);
        this.toastr.error('Resume upload failed.', 'Error');
      },
    });
  }

  triggerResumeUpload() {
    document.getElementById('resumeInput')?.click();
  }

  removeResume() {
    this.profile.update(p => ({ ...p, resume: null }));
  }

  blankExperience(): Partial<Experience> {
    return { title: '', company: '', location: '', startDate: '', endDate: '', current: false, description: '' };
  }

  newExperience: Partial<Experience> = this.blankExperience();

  private toExpDto(e: Partial<Experience>): AddExperienceDto {
    return {
      jobTitle:    e.title       ?? '',
      company:     e.company     ?? '',
      location:    e.location    ?? '',
      startDate:   this.toDateOnly(e.startDate ?? ''),
      endDate:     e.current ? undefined : this.toDateOnly(e.endDate ?? ''),
      isCurrent:   e.current     ?? false,
      description: e.description ?? '',
    };
  }

  /** Convert "Jan 2022" or "2022-01-01" → "YYYY-MM-DD" for DateOnly */
  private toDateOnly(val: string): string {
    if (!val) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
    const d = new Date(val);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  }

  loadExperiences() {
    this.jobSeekerService.getExperiences().subscribe({
      next: (res) => this.profile.update(p => ({
        ...p,
        experience: res.map(e => ({
          id:          String(e.id),
          title:       e.jobTitle,
          company:     e.company,
          location:    e.location ?? '',
          startDate:   e.startDate,
          endDate:     e.endDate ?? '',
          current:     e.isCurrent,
          description: e.description ?? '',
        })),
      })),
      error: (err) => console.error('Failed to load experiences', err),
    });
  }

  openAddExperience() {
    this.newExperience = this.blankExperience();
    this.showAddExperience.set(true);
  }

  saveExperience() {
    const dto = this.toExpDto(this.newExperience);
    this.jobSeekerService.addExperience(dto).subscribe({
      next: (res) => {
        this.profile.update(p => ({
          ...p,
          experience: [...p.experience, {
            id: String(res.id),
            title: dto.jobTitle, company: dto.company,
            location: dto.location ?? '', startDate: this.newExperience.startDate ?? '',
            endDate: this.newExperience.endDate ?? '', current: dto.isCurrent,
            description: dto.description ?? '',
          }],
        }));
        this.showAddExperience.set(false);
        this.toastr.success('Experience added!');
      },
      error: () => this.toastr.error('Failed to add experience.'),
    });
  }

  deleteExperience(id: string) {
    this.jobSeekerService.deleteExperience(Number(id)).subscribe({
      next: () => {
        this.profile.update(p => ({ ...p, experience: p.experience.filter(e => e.id !== id) }));
        this.toastr.success('Experience deleted.');
      },
      error: () => this.toastr.error('Failed to delete experience.'),
    });
  }

  startEditExperience(exp: Experience) {
    this.newExperience = { ...exp };
    this.editingExperienceId.set(exp.id);
    this.showAddExperience.set(true);
  }

  saveEditExperience() {
    const id = this.editingExperienceId()!;
    const dto = this.toExpDto(this.newExperience);
    this.jobSeekerService.updateExperience(Number(id), dto).subscribe({
      next: () => {
        this.profile.update(p => ({
          ...p,
          experience: p.experience.map(e => e.id === id ? {
            id, title: dto.jobTitle, company: dto.company,
            location: dto.location ?? '', startDate: this.newExperience.startDate ?? '',
            endDate: this.newExperience.endDate ?? '', current: dto.isCurrent,
            description: dto.description ?? '',
          } : e),
        }));
        this.editingExperienceId.set(null);
        this.showAddExperience.set(false);
        this.toastr.success('Experience updated!');
      },
      error: () => this.toastr.error('Failed to update experience.'),
    });
  }

  cancelExperience() {
    this.editingExperienceId.set(null);
    this.showAddExperience.set(false);
    this.showExpMapPicker.set(false);
  }

  blankEducation(): Partial<Education> {
    return { degree: '', institution: '', fieldOfStudy: '', startYear: undefined as any, endYear: undefined, isCurrent: false, description: '' };
  }

  newEducation: Partial<Education> = this.blankEducation();

  loadEducation() {
    this.jobSeekerService.getEducation().subscribe({
      next: (res) => this.profile.update(p => ({
        ...p,
        education: res.map(e => ({
          id:           String(e.id),
          degree:       e.degree,
          institution:  e.institution,
          fieldOfStudy: e.fieldOfStudy,
          startYear:    e.startYear,
          endYear:      e.endYear,
          isCurrent:    e.isCurrent,
          description:  e.description,
        })),
      })),
      error: (err) => console.error('Failed to load education', err),
    });
  }

  openAddEducation() {
    this.newEducation = this.blankEducation();
    this.showAddEducation.set(true);
  }

  saveEducation() {
    const dto: AddEducationDto = {
      degree:       this.newEducation.degree       ?? '',
      institution:  this.newEducation.institution  ?? '',
      fieldOfStudy: this.newEducation.fieldOfStudy ?? '',
      startYear:    Number(this.newEducation.startYear),
      endYear:      this.newEducation.isCurrent ? undefined : Number(this.newEducation.endYear) || undefined,
      isCurrent:    this.newEducation.isCurrent    ?? false,
      description:  this.newEducation.description  ?? '',
    };
    this.jobSeekerService.addEducation(dto).subscribe({
      next: (res) => {
        this.profile.update(p => ({
          ...p,
          education: [...p.education, { ...dto, id: String(res.id) }],
        }));
        this.showAddEducation.set(false);
        this.toastr.success('Education added!');
      },
      error: () => this.toastr.error('Failed to add education.'),
    });
  }

  deleteEducation(id: string) {
    this.jobSeekerService.deleteEducation(Number(id)).subscribe({
      next: () => {
        this.profile.update(p => ({ ...p, education: p.education.filter(e => e.id !== id) }));
        this.toastr.success('Education deleted.');
      },
      error: () => this.toastr.error('Failed to delete education.'),
    });
  }

  startEditEducation(edu: Education) {
    this.newEducation = { ...edu };
    this.editingEducationId.set(edu.id);
    this.showAddEducation.set(true);
  }

  saveEditEducation() {
    const id = this.editingEducationId()!;
    const dto: AddEducationDto = {
      degree:       this.newEducation.degree       ?? '',
      institution:  this.newEducation.institution  ?? '',
      fieldOfStudy: this.newEducation.fieldOfStudy ?? '',
      startYear:    Number(this.newEducation.startYear),
      endYear:      this.newEducation.isCurrent ? undefined : Number(this.newEducation.endYear) || undefined,
      isCurrent:    this.newEducation.isCurrent    ?? false,
      description:  this.newEducation.description  ?? '',
    };
    this.jobSeekerService.updateEducation(Number(id), dto).subscribe({
      next: () => {
        this.profile.update(p => ({
          ...p,
          education: p.education.map(e => e.id === id ? { ...dto, id } : e),
        }));
        this.editingEducationId.set(null);
        this.showAddEducation.set(false);
        this.toastr.success('Education updated!');
      },
      error: () => this.toastr.error('Failed to update education.'),
    });
  }

  cancelEducation() {
    this.editingEducationId.set(null);
    this.showAddEducation.set(false);
    this.showEduMapPicker.set(false);
  }

  // ── Skills ─────────────────────────────────────────────────────────────────
  allSkills: { id: number; name: string }[] = [];
  skillSearch = '';
  skillDropdownVisible = false;

  get filteredSkills() {
    const q = this.skillSearch.trim().toLowerCase();
    if (!q) return [];
    return this.allSkills.filter(s =>
      s.name.toLowerCase().includes(q) &&
      !this.profile().skills.includes(s.name)
    );
  }

  loadSkills() {
    this.lookupService.getSkills().subscribe({
      next: (res) => this.allSkills = res,
      error: (err) => console.error('Failed to load skills', err),
    });
  }

  selectSkill(skill: { id: number; name: string }) {
    this.profile.update(p => ({ ...p, skills: [...p.skills, skill.name] }));
    this.skillSearch = '';
    this.skillDropdownVisible = false;
  }

  removeSkill(skill: string) {
    this.profile.update(p => ({ ...p, skills: p.skills.filter(s => s !== skill) }));
  }

  onSkillBlur() {
    setTimeout(() => this.skillDropdownVisible = false, 150);
  }
}