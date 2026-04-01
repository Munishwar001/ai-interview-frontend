import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MapPickerComponent } from '../../../shared/components/map-picker/map-picker';
import { Experience, Education, UserProfileData } from '../profiles.models';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MapPickerComponent],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.scss',
})
export class UserProfile {
  // ── State ──────────────────────────────────────────────────────────────────
  isEditingProfile = signal(false);
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
    experience: [
      {
        id: '1',
        title: 'Senior Frontend Developer',
        company: 'TechCorp Inc.',
        location: 'San Francisco, CA',
        startDate: 'Jan 2022',
        endDate: '',
        current: true,
        description: 'Led frontend development for enterprise SaaS products. Managed a team of 5 developers.',
      },
      {
        id: '2',
        title: 'Frontend Developer',
        company: 'StartupXYZ',
        location: 'Remote',
        startDate: 'Jun 2020',
        endDate: 'Dec 2021',
        current: false,
        description: 'Built responsive web applications using React and TypeScript.',
      },
    ],
    education: [
      {
        id: '1',
        degree: 'Bachelor of Science in Computer Science',
        institution: 'Stanford University',
        location: 'Stanford, CA',
        year: '2020',
      },
    ],
    skills: ['React', 'TypeScript', 'JavaScript', 'Node.js', 'Python', 'GraphQL', 'REST APIs', 'CSS/Tailwind', 'Git', 'Agile'],
  });

  // ── Reactive Form for Edit Profile ────────────────────────────────────────
  profileForm!: FormGroup;

  constructor(private fb: FormBuilder) {
    this.profileForm = this.buildProfileForm();
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

  // ── Computed ───────────────────────────────────────────────────────────────
  completionColor = computed(() => {
    const pct = this.profile().profileCompletion;
    if (pct >= 80) return 'bg-emerald-500';
    if (pct >= 50) return 'bg-violet-500';
    return 'bg-amber-500';
  });

  resumeFileName = computed(() => this.profile().resume?.name ?? null);

  // ── Profile Edit ───────────────────────────────────────────────────────────
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
    this.profile.update(p => ({
      ...p,
      name:     val.name,
      title:    val.title,
      location: val.location,
      email:    val.email,
      // Update the avatarInitial to match the first letter of the new name
      avatarInitial: (val.name as string).charAt(0).toUpperCase(),
      socialLinks: {
        linkedin: val.socialLinks.linkedin || undefined,
        github:   val.socialLinks.github   || undefined,
        website:  val.socialLinks.website  || undefined,
      },
    }));

    this.isEditingProfile.set(false);
  }

  cancelEditProfile() {
    this.isEditingProfile.set(false);
    this.showMapPicker.set(false);
  }

  onLocationSelected(event: { latlng: { lat: number; lng: number }; address: string }) {
    this.profileForm.patchValue({ location: event.address });
    this.showMapPicker.set(false);
  }

  onExpLocationSelected(event: { latlng: { lat: number; lng: number }; address: string }) {
    this.newExperience.location = event.address;
    this.showExpMapPicker.set(false);
  }

  onEduLocationSelected(event: { latlng: { lat: number; lng: number }; address: string }) {
    this.newEducation.location = event.address;
    this.showEduMapPicker.set(false);
  }

  // ── Resume ─────────────────────────────────────────────────────────────────
  onResumeSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    if (file) this.profile.update(p => ({ ...p, resume: file }));
    // Reset input so the same file can be re-selected after removal
    input.value = '';
  }

  triggerResumeUpload() {
    document.getElementById('resumeInput')?.click();
  }

  removeResume() {
    this.profile.update(p => ({ ...p, resume: null }));
  }

  // ── Experience ─────────────────────────────────────────────────────────────
  blankExperience(): Partial<Experience> {
    return { title: '', company: '', location: '', startDate: '', endDate: '', current: false, description: '' };
  }

  newExperience: Partial<Experience> = this.blankExperience();

  openAddExperience() {
    this.newExperience = this.blankExperience();
    this.showAddExperience.set(true);
  }

  saveExperience() {
    const exp: Experience = {
      id:          Date.now().toString(),
      title:       this.newExperience.title       ?? '',
      company:     this.newExperience.company     ?? '',
      location:    this.newExperience.location    ?? '',
      startDate:   this.newExperience.startDate   ?? '',
      endDate:     this.newExperience.endDate     ?? '',
      current:     this.newExperience.current     ?? false,
      description: this.newExperience.description ?? '',
    };
    this.profile.update(p => ({ ...p, experience: [...p.experience, exp] }));
    this.showAddExperience.set(false);
  }

  deleteExperience(id: string) {
    this.profile.update(p => ({ ...p, experience: p.experience.filter(e => e.id !== id) }));
  }

  startEditExperience(exp: Experience) {
    this.newExperience = { ...exp };
    this.editingExperienceId.set(exp.id);
    this.showAddExperience.set(true);
  }

  saveEditExperience() {
    this.profile.update(p => ({
      ...p,
      experience: p.experience.map(e =>
        e.id === this.editingExperienceId()
          ? { ...e, ...this.newExperience, id: e.id }
          : e
      ),
    }));
    this.editingExperienceId.set(null);
    this.showAddExperience.set(false);
  }

  cancelExperience() {
    this.editingExperienceId.set(null);
    this.showAddExperience.set(false);
    this.showExpMapPicker.set(false);
  }

  // ── Education ──────────────────────────────────────────────────────────────
  blankEducation(): Partial<Education> {
    return { degree: '', institution: '', location: '', year: '' };
  }

  newEducation: Partial<Education> = this.blankEducation();

  openAddEducation() {
    this.newEducation = this.blankEducation();
    this.showAddEducation.set(true);
  }

  saveEducation() {
    const edu: Education = {
      id:          Date.now().toString(),
      degree:      this.newEducation.degree      ?? '',
      institution: this.newEducation.institution ?? '',
      location:    this.newEducation.location    ?? '',
      year:        this.newEducation.year        ?? '',
    };
    this.profile.update(p => ({ ...p, education: [...p.education, edu] }));
    this.showAddEducation.set(false);
  }

  deleteEducation(id: string) {
    this.profile.update(p => ({ ...p, education: p.education.filter(e => e.id !== id) }));
  }

  startEditEducation(edu: Education) {
    this.newEducation = { ...edu };
    this.editingEducationId.set(edu.id);
    this.showAddEducation.set(true);
  }

  saveEditEducation() {
    this.profile.update(p => ({
      ...p,
      education: p.education.map(e =>
        e.id === this.editingEducationId()
          ? { ...e, ...this.newEducation, id: e.id }
          : e
      ),
    }));
    this.editingEducationId.set(null);
    this.showAddEducation.set(false);
  }

  cancelEducation() {
    this.editingEducationId.set(null);
    this.showAddEducation.set(false);
    this.showEduMapPicker.set(false);
  }

  // ── Skills ─────────────────────────────────────────────────────────────────
  addSkill() {
    const skill = this.newSkill().trim();
    if (skill && !this.profile().skills.includes(skill)) {
      this.profile.update(p => ({ ...p, skills: [...p.skills, skill] }));
    }
    this.newSkill.set('');
  }

  removeSkill(skill: string) {
    this.profile.update(p => ({ ...p, skills: p.skills.filter(s => s !== skill) }));
  }

  onSkillKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') this.addSkill();
  }
}