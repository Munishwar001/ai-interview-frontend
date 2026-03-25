import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Icons } from '../../../shared/icons/icons';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule, Icons],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  loginForm: FormGroup;
  selectedRole: 'jobseeker' | 'employer' = 'employer';
  showPassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService , 
    private router: Router ,
    private toastr: ToastrService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  getRoleClass(role: string) {
    return this.selectedRole === role
      ? 'flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 border-[#7375F2] bg-[#7375F2] text-white font-semibold text-sm transition-all'
      : 'flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 border-slate-200 bg-white text-slate-500 font-semibold text-sm hover:border-indigo-300 hover:text-indigo-500 transition-all';
  }

  setRole(role: 'jobseeker' | 'employer'): void {
    this.selectedRole = role;
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSignIn(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { email, password } = this.loginForm.value;

    const payload = {
      email,
      password,
      role: this.selectedRole === 'jobseeker' ? 'JobSeeker' : 'Employer',
    };

    this.authService.login(payload).subscribe({
      next: (res) => {
          this.toastr.success('Login successful!');
          this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Login Error:', err);
      },
    });
  }
}