import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Icons } from '../../../shared/icons/icons';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landingpage-pricing',
  imports: [Icons ,CommonModule],
  templateUrl: './landingpage-pricing.html',
  styleUrl: './landingpage-pricing.scss',
})
export class LandingpagePricing {
    
  constructor(private router: Router) {}

  features: string[] = [
    'Free to start',
    'No credit card required',
    'AI-powered matching'
  ];

  onJobSeeker(): void {
    this.router.navigate(['/signup']);
  }

  onSignIn(): void {
    this.router.navigate(['/login']);
  }
}
