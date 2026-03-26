import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Icons } from '../../../shared/icons/icons';

interface Stat {
  value: string;
  label: string;
}

@Component({
  selector: 'app-landingpage-hero',
  standalone: true,
  imports: [CommonModule, Icons],
  templateUrl: './landingpage-hero.html',
  styleUrl: './landingpage-hero.scss',
})
export class LandingpageHero {

  constructor(private router: Router) {}

  // ✅ DATA REQUIRED BY HERO
  stats: Stat[] = [
    { value: '50K+', label: 'Jobs Posted' },
    { value: '100K+', label: 'Successful Hires' },
    { value: '95%', label: 'Match Accuracy' },
    { value: '4.9', label: 'User Rating' },
  ];

  features: string[] = [
    'Free to start',
    'No credit card required',
    'AI-powered matching'
  ];

  onJobSeeker(): void {
    this.router.navigate(['/signup']);
  }

  onEmployer(): void {
    this.router.navigate(['/signup']);
  }
}