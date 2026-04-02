import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AppInput } from '../../../shared/components/app-input/app-input';
import { AppSelect, SelectOption } from '../../../shared/components/app-select/app-select';
import { Icons } from '../../../shared/icons/icons';
import { ToastrService } from 'ngx-toastr';
import { CompanyProfileService } from './Services/company-profile.service';
import { MarkdownService } from '../../../shared/services/markdown.service';
import { environment } from '../../../../../environment/environment';
import { Lookup, lookup } from '../../../shared/services/lookup';

@Component({
  selector: 'app-company-profile',
  imports: [ReactiveFormsModule, CommonModule, AppInput, AppSelect, Icons],
  templateUrl: './company-profile.html',
  styleUrl: './company-profile.scss',
})
export class CompanyProfile implements OnInit {

  @ViewChild('descriptionBox') descriptionBox!: ElementRef;

  profileForm: FormGroup;
  isLoading: boolean = false;
  isSaving: boolean = false;
  isEditing: boolean = false;
  isGenerating: boolean = false;
  isTyping: boolean = false;
  profileCompletion: number = 0;
  currentYear = new Date().getFullYear();
  logoPreview: string | null = null;
  coverPreview: string | null = null;
  companySizeLabel: string = '';
  companySizes: lookup[] = [];
  private logoFile: File | null = null;
  private coverFile: File | null = null;

  get companySizeOptions(): SelectOption[] {
    return this.companySizes.map(s => ({ value: s.id, label: s.name }));
  }

  readonly industryOptions: SelectOption[] = [
    'Technology', 'Finance & Banking', 'Healthcare', 'Education',
    'E-Commerce & Retail', 'Manufacturing', 'Media & Entertainment',
    'Real Estate', 'Logistics & Supply Chain', 'Consulting',
    'Telecommunications', 'Energy & Utilities', 'Government & Public Sector',
    'Non-Profit', 'Legal', 'Marketing & Advertising', 'Hospitality & Tourism',
    'Agriculture', 'Automotive', 'Other',
  ].map(i => ({ value: i, label: i }));

  constructor(
    private fb: FormBuilder,
    private companyProfileService: CompanyProfileService,
    private lookupService: Lookup,
    private toastr: ToastrService,
    public md: MarkdownService
  ) {
    this.profileForm = this.fb.group({
      companyName: ['', [Validators.required, Validators.minLength(2)]],
      tagline: [''],
      description: [''],
      website: [''],
      industry: [''],
      companySizeId: [''],
      foundedYear: [''],
      city: [''],
      state: [''],
      country: [''],
      addressLine1: [''],
      addressLine2: [''],
      postalCode: [''],
      phone: [''],
      email: [''],
      linkedInUrl: [''],
      twitterUrl: [''],
    });
  }

  get companyName() { return this.profileForm.get('companyName')!; }

  ngOnInit(): void {
    this.loadProfile();
    this.loadCompanySizes();
  }

  loadCompanySizes(): void {
    this.lookupService.getCompanySizes().subscribe({
      next: (sizes) => this.companySizes = sizes,
      error: (err) => console.error('Failed to load company sizes:', err),
    });
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
            foundedYear: res.foundedYear,
            city: res.city,
            state: res.state,
            country: res.country,
            addressLine1: res.addressLine1,
            addressLine2: res.addressLine2,
            postalCode: res.postalCode,
            phone: res.phone,
            email: res.email,
            linkedInUrl: res.linkedInUrl,
            twitterUrl: res.twitterUrl,
          });
          this.profileCompletion = res.profileCompletionPercentage ?? 0;
          this.logoPreview = this.toAbsoluteUrl(res.logoUrl);
          this.coverPreview = this.toAbsoluteUrl(res.coverImageUrl);
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

    if (this.descriptionBox) {
      this.profileForm.patchValue({ description: this.descriptionBox.nativeElement.innerText });
    }

    this.isSaving = true;
    const formValue = this.profileForm.value;
    const payload = {
      ...formValue,
      description: this.rawDescription || formValue.description,
      companySizeId: formValue.companySizeId ? Number(formValue.companySizeId) : null,
      foundedYear: formValue.foundedYear ? Number(formValue.foundedYear) : null,
    };

    this.companyProfileService.saveProfile(payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.isEditing = false;
        this.logoFile = null;
        this.coverFile = null;
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
    } else {
      // Populate the contenteditable description box with existing value
      const desc = this.profileForm.value.description || '';
      this.rawDescription = desc;
      setTimeout(() => {
        if (this.descriptionBox) {
          this.descriptionBox.nativeElement.innerHTML = this.md.parse(desc);
        }
      });
    }
  }

  onLogoChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.logoFile = file;
    // Preview immediately
    const reader = new FileReader();
    reader.onload = (e) => { this.logoPreview = e.target?.result as string; };
    reader.readAsDataURL(file);
    // Upload right away
    this.companyProfileService.uploadImages(file, null).subscribe({
      next: (res: any) => {
        this.logoPreview = this.toAbsoluteUrl(res.logoUrl) ?? this.logoPreview;
        this.toastr.success('Logo uploaded!', 'Success');
      },
      error: () => this.toastr.error('Logo upload failed.')
    });
  }

  onCoverChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.coverFile = file;
    const reader = new FileReader();
    reader.onload = (e) => { this.coverPreview = e.target?.result as string; };
    reader.readAsDataURL(file);
    // Upload right away
    this.companyProfileService.uploadImages(null, file).subscribe({
      next: (res: any) => {
        this.coverPreview = this.toAbsoluteUrl(res.coverImageUrl) ?? this.coverPreview;
        this.toastr.success('Cover image uploaded!', 'Success');
      },
      error: () => this.toastr.error('Cover upload failed.')
    });
  }

  triggerLogoUpload(): void {
    document.getElementById('logoInput')?.click();
  }

  triggerCoverUpload(): void {
    document.getElementById('coverInput')?.click();
  }

  generateDescriptionWithAI(): void {
    const { companyName, industry, tagline } = this.profileForm.value;
    if (!companyName) {
      this.toastr.warning('Please enter company name first.', 'Required');
      return;
    }

    this.isGenerating = true;
    this.profileForm.patchValue({ description: '' });
    if (this.descriptionBox) {
      this.descriptionBox.nativeElement.innerHTML = '';
    }

    this.companyProfileService.generateDescription(companyName, industry ?? '', tagline ?? '').subscribe({
      next: (res) => {
        this.isGenerating = false;
        this.typewriterEffect(res.description);
        this.toastr.success('Description generated!', 'AI');
      },
      error: (err: any) => {
        this.isGenerating = false;
        console.error('AI Error:', err);
        this.toastr.error('Failed to generate description.');
      },
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
          this.descriptionBox.nativeElement.innerHTML = this.md.parse(currentText);
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

  private toAbsoluteUrl(path: string | null | undefined): string | null {
    if (!path) return null;
    return path.startsWith('http') ? path : `${environment.url}${path}`;
  }

  getCompletionColor(): string {
    if (this.profileCompletion >= 80) return 'bg-green-500';
    if (this.profileCompletion >= 50) return 'bg-purple-500';
    return 'bg-orange-400';
  }
}
