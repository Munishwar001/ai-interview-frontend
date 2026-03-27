import { Component, Input } from '@angular/core';
import { ControlContainer, FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-input',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './app-input.html',
  styleUrl: './app-input.scss',
})
export class AppInput {
   @Input() label!: string;
  @Input() controlName!: string;
  @Input() placeholder: string = '';
  @Input() type: string = 'text';

  constructor(private controlContainer: ControlContainer) {}

  get control(): FormControl {
    return this.controlContainer.control?.get(this.controlName) as FormControl;
  }
}
