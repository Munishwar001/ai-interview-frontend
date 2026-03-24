import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Icons } from '../../../shared/icons/icons';
import { UserRole } from '../../../shared/enums/UserRole ';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-signup',
  imports: [CommonModule, ReactiveFormsModule, Icons],
  templateUrl: './signup.html',
  styleUrl: './signup.scss',
})
export class Signup {
  signupForm: FormGroup;

  selectedIntent: 'find' | 'hire' = 'find';
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: Auth,
  ) {
    this.signupForm = this.fb.group({
      fullName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    });
  }

  setIntent(intent: 'find' | 'hire'): void {
    this.selectedIntent = intent;
  }

  getSelectedRole(): UserRole {
    return this.selectedIntent === 'find' ? UserRole.JobSeeker : UserRole.Employer;
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onCreateAccount(): void {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    const { password, confirmPassword, fullName, email } = this.signupForm.value;

    if (password !== confirmPassword) {
      console.error('Passwords do not match');
      return;
    }

    const payload = {
      fullName,
      email,
      password,
      role: this.getSelectedRole(),
    };

    this.authService.register(payload).subscribe({
      next: (res) => {
        console.log('Success:', res);
      },
      error: (err) => {
        console.error('Error:', err);
      },
    });
  }
}
