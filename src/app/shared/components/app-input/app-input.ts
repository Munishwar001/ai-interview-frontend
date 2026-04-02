import { Component, Input, Optional } from '@angular/core';
import { ControlContainer, FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './app-input.html',
  styleUrl: './app-input.scss',
})
export class AppInput {
  @Input() label = '';
  @Input() controlName!: string;
  @Input() placeholder = '';
  @Input() type = 'text';
  @Input() required = false;
  @Input() prefix = '';         // e.g. 'https://' or 'linkedin.com/company/'

  /** View/edit mode support */
  @Input() isEditing = true;    // default true = always editable (backward compat)
  @Input() viewValue: any = ''; // value to show in view mode

  constructor(@Optional() private controlContainer: ControlContainer) {}

  get control(): FormControl {
    return this.controlContainer?.control?.get(this.controlName) as FormControl;
  }

  get displayValue(): string {
    const v = this.viewValue ?? this.control?.value;
    return v ? String(v) : 'Not set';
  }
}
