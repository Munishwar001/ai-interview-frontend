import { Component, OnInit,ViewChild,ElementRef} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Icons } from '../../../shared/icons/icons';
import { Lookup } from '../../../shared/services/lookup';
import { AppInput } from '../../../shared/components/app-input/app-input';
import { JobService } from '../services/post-job';
import { JobPreviewComponent } from '../job-preview/job-preview.component';
@Component({
  selector: 'app-post-job-home',
  imports: [ReactiveFormsModule, FormsModule, CommonModule, Icons, AppInput, JobPreviewComponent],
  templateUrl: './post-job-home.html',
  styleUrl: './post-job-home.scss',
})
export class PostJobHome implements OnInit {
  @ViewChild('preview')
  previewComponent!: JobPreviewComponent;
  jobForm: FormGroup;
  jobTypes: any[] = [];
  skills: any[] = [];
  selectedSkills: any[] = [];
  filteredSkills: any[] = [];
  skillSearch: string = '';
  showDropdown: boolean = false;
  isGenerating: boolean = false;
  isTyping: boolean = false;

  @ViewChild('descriptionBox') descriptionBox!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private lookup: Lookup,
    private jobService: JobService,
  ) {
    this.jobForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      location: [''],
      jobType: [''],
      salaryMin: ['', [Validators.min(0)]],
      salaryMax: ['', [Validators.min(0)]],
      requiredSkills: [''],
      description: [''],
      skillIds: [[]]
    });
  }

  get title() {
    return this.jobForm.get('title')!;
  }
  get location() {
    return this.jobForm.get('location')!;
  }
  get jobType() {
    return this.jobForm.get('jobType')!;
  }
  get salaryMin() {
    return this.jobForm.get('salaryMin')!;
  }
  get salaryMax() {
    return this.jobForm.get('salaryMax')!;
  }
  get requiredSkills() {
    return this.jobForm.get('requiredSkills')!;
  }
  get jobDescription() {
    return this.jobForm.get('jobDescription')!;
  }

  ngOnInit(): void {
    this.getJobTypes();
    this.getSkills();
  }

  onPreview() {
    this.previewComponent.open();
  }

  onSubmit() {
    if (this.jobForm.invalid) {
      this.jobForm.markAllAsTouched();
      return;
    }
    const payload = this.jobForm.value;
    console.log('Payload:', payload);
    this.jobService.createJob(payload).subscribe({
      next: (res) => {
        console.log('Job Created:', res);
        alert('Job posted successfully 🔥');
        this.jobForm.reset();
      },
      error: (err) => {
        console.error('Error creating job', err);
        alert('Something went wrong ❌');
      },
    });
  }

  getJobTypes() {
    this.lookup.getJobTypes().subscribe({
      next: (res) => {
        console.log('Job Types:', res);
        this.jobTypes = res;
      },
      error: (err) => console.error(err),
    });
  }

  getSkills() {
    this.lookup.getSkills().subscribe({
      next: (res) => {
        console.log('Skills:', res);
        this.skills = res;
      },
      error: (err) => console.error(err),
    });
  }

  onSkillSearch() {
    const query = this.skillSearch.trim().toLowerCase();
    if (!query) {
      this.filteredSkills = [];
      return;
    }
    this.filteredSkills = this.skills.filter(
      (s) =>
        s.name.toLowerCase().includes(query) &&
        !this.selectedSkills.find((sel) => sel.id === s.id),
    );
  }

  selectSkill(skill: any) {
    this.selectedSkills.push(skill);
    this.skillSearch = '';
    this.filteredSkills = [];
    this.showDropdown = false;
    this.jobForm.patchValue({
      skillIds: this.selectedSkills.map(s => s.id)
    });
  }

  removeSkill(skill: any) {
    this.selectedSkills = this.selectedSkills.filter((s) => s.id !== skill.id);
    this.jobForm.patchValue({
      skillIds: this.selectedSkills.map(s => s.id)
    });
  }

  onBlur() {
    setTimeout(() => {
      this.showDropdown = false;
      this.filteredSkills = [];
    }, 150);
  }

  highlightMatch(name: string): string {
    const query = this.skillSearch.trim();
    if (!query) return name;
    const regex = new RegExp(`(${query})`, 'gi');
    return name.replace(
      regex,
      '<mark class="bg-purple-100 text-purple-700 rounded px-0.5 font-semibold not-italic">$1</mark>',
    );
  }

  generateWithAI() {
    if (!this.jobForm.value.title) {
      alert('Please enter job title first ⚠️');
      return;
    }

    const payload = {
      title: this.jobForm.value.title,
      skills: this.selectedSkills.map(s => s.name)
    };

    this.isGenerating = true;
    this.jobForm.patchValue({ description: '' });

    this.jobService.generateDescription(payload).subscribe({
      next: (res) => {
        this.isGenerating = false;
        this.typewriterEffect(res.description);
      },
      error: (err) => {
        this.isGenerating = false;
        console.error('AI Error:', err);
        alert('Failed to generate description ❌');
      }
    });
  }

  markdownToHtml(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  
    .replace(/\*(.*?)\*/g, '<em>$1</em>')              
    .replace(/^- (.+)/gm, '• $1')                      
    .replace(/\n/g, '<br>');                    
}

onDescriptionInput(event: Event) {
  const el = event.target as HTMLElement;
  this.jobForm.patchValue({ description: el.innerText });
}

 typewriterEffect(text: string) {
  this.isTyping = true;
  let i = 0;
  let currentText = '';
  this.jobForm.patchValue({ description: '' });

  const interval = setInterval(() => {
    if (i < text.length) {
      currentText += text.charAt(i);
      // Update the div's HTML with parsed markdown
      if (this.descriptionBox) {
        this.descriptionBox.nativeElement.innerHTML = this.markdownToHtml(currentText);
        // Auto scroll to bottom
        this.descriptionBox.nativeElement.scrollTop = 
          this.descriptionBox.nativeElement.scrollHeight;
      }
      this.jobForm.patchValue({ description: currentText });
      i++;
    } else {
      clearInterval(interval);
      this.isTyping = false;
    }
  }, 18);
}
}