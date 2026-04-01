import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AppInput } from '../../../shared/components/app-input/app-input';
import { ToastrService } from 'ngx-toastr';
import { CompanyProfileService } from './Services/company-profile.service';
import { JobService } from '../../post-job/services/post-job';
import { marked } from 'marked';

@Component({
  selector: 'app-company-profile',
  imports: [ReactiveFormsModule, CommonModule, AppInput],
  templateUrl: './company-profile.html',
  styleUrl: './company-profile.scss',
})
export class CompanyProfile implements OnInit {
export class CompanyProfile implements OnInit {

  @ViewChild('descriptionBox') descriptionBox!: ElementRef;

  profileForm: FormGroup;
  isLoading: boolean = false;
  isSaving: boolean = false;
  isEditing: boolean = false;
  isGenerating: boolean = false;
  isTyping: boolean = false;
  profileCompletion: number = 0;
  logoPreview: string | null = null;
  coverPreview: string | null = null;
  companySizeLabel: string = '';

  constructor(
    private fb: FormBuilder,
    private companyProfileService: CompanyProfileService,
    private jobService: JobService,
    private toastr: ToastrService
  ) {
    this.profileForm = this.fb.group({
      companyName: ['', [Validators.required, Validators.minLength(2)]],
      tagline: [''],
      description: [''],
      website: [''],
      industry: [''],
      companySizeId: [''],
      city: [''],
      country: [''],
    });
  }

  get companyName() { return this.profileForm.get('companyName')!; }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading = true;
    this.companyProfileService.getProfile().subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res) {
          this.profileForm.patchValue({
            companyName: res.companyName,
            tagline: res.tagline,
            description: res.description,
            website: res.website,
            industry: res.industry,
            companySizeId: res.companySizeId,
            city: res.city,
            country: res.country,
          });
          this.profileCompletion = res.profileCompletionPercentage ?? 0;
          this.logoPreview = res.logoUrl ?? null;
          this.companySizeLabel = res.companySizeLabel ?? '';
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Load profile error:', err);
      }
    });
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      this.toastr.warning('Please fill all required fields.', 'Validation');
      return;
    }

    // sync contenteditable box to form before saving
    if (this.descriptionBox) {
      this.profileForm.patchValue({ description: this.descriptionBox.nativeElement.innerText });
    }

    this.isSaving = true;
    const formValue = this.profileForm.value;
    const payload = {
      ...formValue,
      description: this.rawDescription || formValue.description,
      companySizeId: formValue.companySizeId ? Number(formValue.companySizeId) : null,
    };
    this.companyProfileService.saveProfile(payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.isEditing = false;
        this.toastr.success('Company profile saved successfully!', 'Success');
        this.loadProfile();
      },
      error: (err: any) => {
        this.isSaving = false;
        console.error('Save error:', err);
      }
    });
  }

  onDiscard(): void {
    this.isEditing = false;
    this.loadProfile();
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.loadProfile();
    }
  }

  onLogoChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => { this.logoPreview = e.target?.result as string; };
    reader.readAsDataURL(file);
  }

  triggerLogoUpload(): void {
    document.getElementById('logoInput')?.click();
  }

  onCoverChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => { this.coverPreview = e.target?.result as string; };
    reader.readAsDataURL(file);
  }

  triggerCoverUpload(): void {
    document.getElementById('coverInput')?.click();
  }

  generateDescriptionWithAI(): void {
    const companyName = this.profileForm.value.companyName;
    if (!companyName) {
      this.toastr.warning('Please enter company name first.', 'Required');
      return;
    }

    const industry = this.profileForm.value.industry;
    const payload = {
      title: companyName,
      skills: industry ? [industry] : []
    };

    this.isGenerating = true;
    this.profileForm.patchValue({ description: '' });
    if (this.descriptionBox) {
      this.descriptionBox.nativeElement.innerHTML = '';
    }

    this.jobService.generateDescription(payload).subscribe({
      next: (res: any) => {
        this.isGenerating = false;
        this.typewriterEffect(res.description);
        this.toastr.success('Description generated!', 'AI');
      },
      error: (err: any) => {
        this.isGenerating = false;
        console.error('AI Error:', err);
      }
    });
  }

  private rawDescription: string = '';

  typewriterEffect(text: string): void {
    this.isTyping = true;
    this.rawDescription = '';
    let i = 0;
    let currentText = '';

    const interval = setInterval(() => {
      if (i < text.length) {
        currentText += text.charAt(i);
        this.rawDescription = currentText;
        if (this.descriptionBox) {
          this.descriptionBox.nativeElement.innerHTML = marked.parse(currentText) as string;
          this.descriptionBox.nativeElement.scrollTop = this.descriptionBox.nativeElement.scrollHeight;
        }
        this.profileForm.patchValue({ description: currentText });
        i++;
      } else {
        clearInterval(interval);
        this.isTyping = false;
      }
    }, 18);
  }

  onDescriptionInput(event: Event): void {
    const el = event.target as HTMLElement;
    this.rawDescription = el.innerText;
    this.profileForm.patchValue({ description: el.innerText });
  }

  getCompletionColor(): string {
    if (this.profileCompletion >= 80) return 'bg-green-500';
    if (this.profileCompletion >= 50) return 'bg-purple-500';
    return 'bg-orange-400';
  }
}
