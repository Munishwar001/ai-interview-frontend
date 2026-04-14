import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { LocationSearch } from '../../../shared/components/location-search/location-search';
import { DatePickerComponent } from '../../../shared/components/date-picker/date-picker';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { AppDatePipe } from '../../../shared/pipes/app-date.pipe';
import { Experience, Education, LocationSelection } from '../profiles.models';
import { ProfileStateService } from './services/profile-state.service';
import { ExperienceStateService } from './services/experience-state.service';
import { EducationStateService } from './services/education-state.service';
import { SkillsStateService } from './services/skills-state.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LocationSearch, DatePickerComponent, EmptyState, AppDatePipe],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.scss',
  providers: [ProfileStateService, ExperienceStateService, EducationStateService, SkillsStateService],
})
export class UserProfile implements OnInit {
  readonly currentYear = new Date().getFullYear();
  private pdfDataUrl = signal<SafeResourceUrl | null>(null);
  readonly safePdfUrl = this.pdfDataUrl.asReadonly();

  constructor(
    public ps: ProfileStateService,
    public exp: ExperienceStateService,
    public edu: EducationStateService,
    public skills: SkillsStateService,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnInit() {
    this.ps.load();
    this.exp.load(this.ps.profile);
    this.edu.load(this.ps.profile);
    this.skills.load(this.ps.profile);
  }

  // ── Profile ────────────────────────────────────────────────────────────────
  get profile() { return this.ps.profile; }
  get profileForm() { return this.ps.profileForm; }
  get f() { return this.ps.f; }
  get completionColor() { return this.ps.completionColor; }
  get resumeFileName() { return this.ps.resumeFileName; }
  get isLoading() { return this.ps.isLoading; }
  get isSaving() { return this.ps.isSaving; }
  get isEditingProfile() { return this.ps.isEditingProfile; }
  get showMapPicker() { return this.ps.showMapPicker; }
  get isUploadingResume() { return this.ps.isUploadingResume; }

  openEditProfile() { this.ps.openEdit(); }
  saveProfile() { this.ps.save(); }
  cancelEditProfile() { this.ps.cancelEdit(); }

  onLocationSelected(e: LocationSelection) {
    this.ps.profileForm.patchValue({ location: e.address });
    this.ps.showMapPicker.set(false);
  }

  onResumeSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    (event.target as HTMLInputElement).value = '';
    if (file) this.ps.onResumeSelected(file);
  }

  triggerResumeUpload() { document.getElementById('resumeInput')?.click(); }
  removeResume() { this.ps.removeResume(); }
  downloadResume() { this.ps.downloadResume(); }
  printResume() { this.ps.printResume(); }
  
  openPdfPreview() {
    this.ps.loadPdfBlob().subscribe({
      next: (blob) => {
        const dataUrl = URL.createObjectURL(blob);
        const safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(dataUrl);
        this.pdfDataUrl.set(safeUrl);
        this.ps.openPdfPreview();
      },
      error: () => {
        console.error('Failed to load PDF for preview');
      },
    });
  }

  closePdfPreview() {
    this.ps.closePdfPreview();
    this.pdfDataUrl.set(null);
  }

  get resumeFilePath() { return this.ps.resumeFilePath; }
  get showPdfPreview() { return this.ps.showPdfPreview; }

  triggerAvatarUpload() { document.getElementById('avatarInput')?.click(); }
  onAvatarSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    (event.target as HTMLInputElement).value = '';
    if (file) this.ps.onAvatarSelected(file);
  }
  removeAvatar() { this.ps.removeAvatar(); }
  get isUploadingAvatar() { return this.ps.isUploadingAvatar; }
  get avatarUrl() { return this.ps.avatarUrl; }
  get showAvatarModal() { return this.ps.showAvatarModal; }

  // ── Experience ─────────────────────────────────────────────────────────────
  get newExperience() { return this.exp.newExperience; }
  get showAddExperience() { return this.exp.showModal; }
  get editingExperienceId() { return this.exp.editingId; }
  get showExpMapPicker() { return this.exp.showMapPicker; }

  openAddExperience() { this.exp.openAdd(); }
  startEditExperience(e: Experience) { this.exp.openEdit(e); }
  saveExperience() { this.exp.save(this.ps.profile); }
  saveEditExperience() { this.exp.update(this.ps.profile); }
  deleteExperience(id: string) { this.exp.delete(id, this.ps.profile); }
  cancelExperience() { this.exp.cancel(); }

  onExpLocationSelected(e: LocationSelection) {
    this.exp.newExperience.location = e.address;
    this.exp.showMapPicker.set(false);
  }

  // ── Education ──────────────────────────────────────────────────────────────
  get newEducation() { return this.edu.newEducation; }
  get showAddEducation() { return this.edu.showModal; }
  get editingEducationId() { return this.edu.editingId; }
  get newEducationStartDate() { return this.edu.startYearInput; }
  set newEducationStartDate(v: string) { this.edu.startYearInput = v; }
  get newEducationEndDate() { return this.edu.endYearInput; }
  set newEducationEndDate(v: string) { this.edu.endYearInput = v; }

  openAddEducation() { this.edu.openAdd(); }
  startEditEducation(e: Education) { this.edu.openEdit(e); }
  saveEducation() { this.edu.save(this.ps.profile); }
  saveEditEducation() { this.edu.update(this.ps.profile); }
  deleteEducation(id: string) { this.edu.delete(id, this.ps.profile); }
  cancelEducation() { this.edu.cancel(); }

  // ── Skills ─────────────────────────────────────────────────────────────────
  get filteredSkills() { return this.skills.filtered; }
  get skillSearch() { return this.skills.search; }
  set skillSearch(v: string) { this.skills.search = v; this.skills.dropdownVisible = true; }
  get skillDropdownVisible() { return this.skills.dropdownVisible; }
  set skillDropdownVisible(v: boolean) { this.skills.dropdownVisible = v; }
  showSkillDropdown() { this.skills.dropdownVisible = true; }

  selectSkill(s: any) { this.skills.select(s, this.ps.profile); }
  removeSkill(name: string) { this.skills.remove(name, this.ps.profile); }
  onSkillBlur() { this.skills.onBlur(); }
}
