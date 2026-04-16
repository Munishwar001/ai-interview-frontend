import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Icons } from '../../../shared/icons/icons';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Icons, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss',
})
export class ForgotPassword {
  forgotPasswordForm: FormGroup;
  isSubmitting = false;
  requestSent = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastr: ToastrService,
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  sendResetLink(): void {
    this.requestSent = false;

    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    const { email } = this.forgotPasswordForm.value;
    this.isSubmitting = true;

    this.authService.forgotPassword({ email }).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.requestSent = true;
        this.toastr.success('If the email exists, a reset link has been sent.');
      },
      error: (err) => {
        this.isSubmitting = false;
        const message = err?.error?.message || err?.error || 'Unable to send reset link. Please try again.';
        this.toastr.error(message);
      },
    });
  }
}