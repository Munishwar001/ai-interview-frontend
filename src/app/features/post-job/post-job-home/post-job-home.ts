import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Icons } from '../../../shared/icons/icons';

@Component({
  selector: 'app-post-job-home',
  imports: [ReactiveFormsModule, CommonModule, Icons],
  templateUrl: './post-job-home.html',
  styleUrl: './post-job-home.scss',
})
export class PostJobHome {

  jobForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.jobForm = this.fb.group({
      jobTitle:      ['', [Validators.required, Validators.minLength(3)]],
      location:      [''],
      jobType:       [''],
      salaryRange:   [''],
      requiredSkills:[''],
      jobDescription:[''],
    });
  }

  get jobTitle()       { return this.jobForm.get('jobTitle')!; }
  get location()       { return this.jobForm.get('location')!; }
  get jobType()        { return this.jobForm.get('jobType')!; }
  get salaryRange()    { return this.jobForm.get('salaryRange')!; }
  get requiredSkills() { return this.jobForm.get('requiredSkills')!; }
  get jobDescription() { return this.jobForm.get('jobDescription')!; }

  onPreview() {
    console.log('Preview:', this.jobForm.value);
  }

  onSubmit() {
    if (this.jobForm.invalid) {
      this.jobForm.markAllAsTouched();
      return;
    }
    console.log('Post Job:', this.jobForm.value);
  }
}