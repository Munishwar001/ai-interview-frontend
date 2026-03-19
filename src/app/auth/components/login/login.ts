import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Icons } from '../../../shared/icons/icons';
@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule, Icons],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  selectedRole: 'jobseeker' | 'employer' = 'employer';
  email: string = '';
  password: string = '';
  showPassword: boolean = false;

  getRoleClass(role: string) {
    return this.selectedRole === role
      ? 'flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 border-indigo-600 bg-indigo-600 text-white font-semibold text-sm transition-all'
      : 'flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 border-slate-200 bg-white text-slate-500 font-semibold text-sm hover:border-indigo-300 hover:text-indigo-500 transition-all';
  }

  setRole(role: 'jobseeker' | 'employer'): void {
    this.selectedRole = role;
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSignIn(): void {
    console.log('Sign in as:', this.selectedRole);
    console.log('Email:', this.email);
    // Add your auth logic here
  }
}
