import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Icons } from '../../../shared/icons/icons';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Icons, RouterLink],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss',
})
export class ResetPassword implements OnInit {
  resetForm: FormGroup;
  isSubmitting = false;
  showPassword = false;
  showConfirmPassword = false;
  passwordMismatch = false;
  invalidResetLink = false;
  private uid = '';
  private resetCode = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router,
  ) {
    this.resetForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.uid = this.route.snapshot.queryParamMap.get('Uid') || this.route.snapshot.queryParamMap.get('uid') || '';
    this.resetCode = this.route.snapshot.queryParamMap.get('code') || this.route.snapshot.queryParamMap.get('Code') || '';

    if (!this.uid || !this.resetCode) {
      this.invalidResetLink = true;
    }

    this.resetForm.get('newPassword')?.valueChanges.subscribe(() => {
      this.passwordMismatch = false;
    });

    this.resetForm.get('confirmPassword')?.valueChanges.subscribe(() => {
      this.passwordMismatch = false;
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onResetPassword(): void {
    this.passwordMismatch = false;

    if (this.invalidResetLink) {
      this.toastr.error('Invalid password reset link. Please request a new one.');
      return;
    }

    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    const { newPassword, confirmPassword } = this.resetForm.value;

    if (newPassword !== confirmPassword) {
      this.passwordMismatch = true;
      return;
    }

    this.isSubmitting = true;

    this.authService.resetPassword({
      Uid: this.uid,
      Code: this.resetCode,
      NewPassword: newPassword,
    }).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.toastr.success(res?.message || res?.Message || 'Password has been reset.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isSubmitting = false;
        const message = err?.error?.message || err?.error || 'Unable to reset password. Please try again.';
        this.toastr.error(message);
      },
    });
  }
}
