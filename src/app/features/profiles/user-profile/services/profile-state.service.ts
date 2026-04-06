import { Injectable, signal, computed } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { UserProfileData } from '../../profiles.models';
import { JobSeekerService } from './job-seeker.service';
import { environment } from '../../../../../../environment/environment';

@Injectable()
export class ProfileStateService {
  readonly isLoading = signal(true);
  readonly isSaving = signal(false);
  readonly isEditingProfile = signal(false);
  readonly showMapPicker = signal(false);
  readonly isUploadingResume = signal(false);
  readonly isUploadingAvatar = signal(false);
  readonly showAvatarModal = signal(false);

  readonly profile = signal<UserProfileData>({
    name: '', title: '', location: '', email: '',
    avatarInitial: '', profileCompletion: 0,
    socialLinks: {}, resume: null,
    experience: [], education: [], skills: [],
  });

  readonly avatarUrl = computed(() => {
    const url = this.profile().avatarUrl;
    if (!url) return null;
    return url.startsWith('http') ? url : `${environment.url}${url}`;
  });

  readonly completionColor = computed(() => {
    const pct = this.profile().profileCompletion;
    if (pct >= 80) return 'bg-emerald-500';
    if (pct >= 50) return 'bg-violet-500';
    return 'bg-amber-500';
  });

  readonly resumeFileName = computed(() =>
    this.profile().resumeFileName ?? this.profile().resume?.name ?? null
  );

  profileForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private svc: JobSeekerService,
    private toastr: ToastrService,
  ) {
    this.profileForm = this.buildForm();
  }

  get f() { return this.profileForm.controls; }

  private buildForm(): FormGroup {
    return this.fb.group({
      name:     ['', [Validators.required]],
      title:    [''],
      location: [''],
      email:    ['', [Validators.required, Validators.email]],
      socialLinks: this.fb.group({
        linkedin: [''], github: [''], website: [''],
      }),
    });
  }

  load() {
    this.isLoading.set(true);
    this.svc.getProfile().subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (!res) return;
        this.profile.update(p => ({
          ...p,
          name:              res.name          ?? p.name,
          title:             res.title         ?? p.title,
          location:          res.location      ?? p.location,
          email:             res.email         ?? p.email,
          avatarInitial:     res.initial       ?? (res.name?.charAt(0).toUpperCase() ?? p.avatarInitial),
          avatarUrl:         res.avatar        ?? p.avatarUrl,
          profileCompletion: res.profileCompletion ?? p.profileCompletion,
          resumeFileName:    res.resumeFileName ?? p.resumeFileName,
          resumeFilePath:    res.resumeFilePath ?? p.resumeFilePath,
          socialLinks: {
            linkedin: res.linkedIn ?? p.socialLinks.linkedin,
            github:   res.gitHub   ?? p.socialLinks.github,
            website:  res.website  ?? p.socialLinks.website,
          },
        }));
      },
      error: () => this.isLoading.set(false),
    });
  }

  openEdit() {
    const p = this.profile();
    this.profileForm.reset({
      name: p.name, title: p.title, location: p.location, email: p.email,
      socialLinks: {
        linkedin: p.socialLinks.linkedin ?? '',
        github:   p.socialLinks.github   ?? '',
        website:  p.socialLinks.website  ?? '',
      },
    });
    this.isEditingProfile.set(true);
  }

  save() {
    if (this.profileForm.invalid) { this.profileForm.markAllAsTouched(); return; }
    const val = this.profileForm.value;
    const dto = {
      name: val.name, title: val.title, location: val.location, email: val.email,
      initial:  (val.name as string).charAt(0).toUpperCase(),
      linkedIn: val.socialLinks.linkedin || undefined,
      gitHub:   val.socialLinks.github   || undefined,
      website:  val.socialLinks.website  || undefined,
    };
    this.isSaving.set(true);
    this.svc.upsertProfile(dto).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.isEditingProfile.set(false);
        this.toastr.success('Profile saved!');
        this.load(); // refresh profileCompletion from backend
      },
      error: () => { this.isSaving.set(false); this.toastr.error('Failed to save profile.'); },
    });
  }

  cancelEdit() {
    this.isEditingProfile.set(false);
    this.showMapPicker.set(false);
  }

  // ── Resume ──────────────────────────────────────────────────────────────────
  onResumeSelected(file: File) {
    this.isUploadingResume.set(true);
    this.svc.uploadResume(file).subscribe({
      next: () => {
        this.isUploadingResume.set(false);
        this.toastr.success('Resume uploaded!');
        this.load(); // refresh profileCompletion from backend
      },
      error: () => { this.isUploadingResume.set(false); this.toastr.error('Resume upload failed.'); },
    });
  }

  removeResume() {
    this.svc.deleteResume().subscribe({
      next: () => {
        this.profile.update(p => ({ ...p, resume: null, resumeFileName: undefined, resumeFilePath: undefined }));
        this.toastr.success('Resume deleted.');
        this.load(); // refresh profileCompletion
      },
      error: () => this.toastr.error('Failed to delete resume.'),
    });
  }

  downloadResume() {
    this.svc.downloadResume().subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = this.resumeFileName() ?? 'resume'; a.click();
        URL.revokeObjectURL(url);
      },
      error: () => this.toastr.error('Failed to download resume.'),
    });
  }

  printResume() {
    this.svc.downloadResume().subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const iframe = document.createElement('iframe');
        iframe.style.cssText = 'position:fixed;width:0;height:0;border:0;visibility:hidden';
        iframe.src = url;
        document.body.appendChild(iframe);
        iframe.onload = () => {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          setTimeout(() => { document.body.removeChild(iframe); URL.revokeObjectURL(url); }, 60000);
        };
      },
      error: () => this.toastr.error('Failed to load resume for printing.'),
    });
  }

  // ── Avatar ──────────────────────────────────────────────────────────────────
  onAvatarSelected(file: File) {
    this.isUploadingAvatar.set(true);
    this.svc.uploadAvatar(file).subscribe({
      next: (res) => {
        this.isUploadingAvatar.set(false);
        this.showAvatarModal.set(false);
        this.profile.update(p => ({ ...p, avatarUrl: res.avatarPath }));
        this.toastr.success('Avatar updated!');
        this.load();
      },
      error: () => { this.isUploadingAvatar.set(false); this.toastr.error('Avatar upload failed.'); },
    });
  }

  removeAvatar() {
    this.svc.deleteAvatar().subscribe({
      next: () => {
        this.profile.update(p => ({ ...p, avatarUrl: undefined }));
        this.showAvatarModal.set(false);
        this.toastr.success('Avatar removed.');
        this.load();
      },
      error: () => this.toastr.error('Failed to remove avatar.'),
    });
  }
}
