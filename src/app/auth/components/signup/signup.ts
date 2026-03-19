import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Icons } from '../../../shared/icons/icons';
@Component({
  selector: 'app-signup',
  imports: [FormsModule, CommonModule, Icons],
  templateUrl: './signup.html',
  styleUrl: './signup.scss',
})
export class Signup {
  selectedIntent: 'find' | 'hire' = 'find';
  fullName: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  setIntent(intent: 'find' | 'hire'): void {
    this.selectedIntent = intent;
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onCreateAccount(): void {
    if (this.password !== this.confirmPassword) {
      console.error('Passwords do not match');
      return;
    }
    console.log('Creating account:', {
      intent: this.selectedIntent,
      fullName: this.fullName,
      email: this.email,
    });
    // Add your registration logic here
  }
}
