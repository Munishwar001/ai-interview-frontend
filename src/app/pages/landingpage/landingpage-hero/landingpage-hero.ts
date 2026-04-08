import {
  Component, ElementRef, ViewChild, ViewChildren,
  QueryList, AfterViewInit, OnDestroy, NgZone
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Icons } from '../../../shared/icons/icons';
import gsap from 'gsap';

interface Stat { value: string; label: string; }

@Component({
  selector: 'app-landingpage-hero',
  standalone: true,
  imports: [CommonModule, Icons],
  templateUrl: './landingpage-hero.html',
  styleUrl: './landingpage-hero.scss',
})
export class LandingpageHero implements AfterViewInit, OnDestroy {

  @ViewChild('wordContainer') wordContainer!: ElementRef<HTMLElement>;
  @ViewChildren('wordEl') wordEls!: QueryList<ElementRef<HTMLElement>>;

  private intervalId: any;
  private currentIndex = 0;

  constructor(private router: Router, private ngZone: NgZone) {}

  rotatingWords: string[] = [
    'Smarter', 
    'Quicker',
    'Sharper',
    'Smarter',
  ];

  stats: Stat[] = [
    { value: '50K+',  label: 'Jobs Posted' },
    { value: '100K+', label: 'Successful Hires' },
    { value: '95%',   label: 'Match Accuracy' },
    { value: '4.9',   label: 'User Rating' },
  ];

  features: string[] = [
    'Free to start',
    'No credit card required',
    'AI-powered matching',
  ];

  ngAfterViewInit(): void {
    // Give Angular a tick to render *ngFor items
    setTimeout(() => {
      this.ngZone.runOutsideAngular(() => this.startWordRotation());
    }, 100);
  }

  private startWordRotation(): void {
    const els = this.wordEls.toArray().map(r => r.nativeElement);
    if (!els.length) return;

    // Initial setup - show first word
    gsap.set(els[0], { opacity: 1, y: 0, display: 'flex' });
    els.forEach((el, idx) => {
      if (idx !== 0) gsap.set(el, { opacity: 0, y: 20, display: 'flex' });
    });

    this.intervalId = setInterval(() => {
      const current = els[this.currentIndex];
      const next = els[(this.currentIndex + 1) % els.length];

      // Animate OUT current word (slide up and fade)
      gsap.to(current, {
        opacity: 0,
        y: -40,
        duration: 0.4,
        ease: 'power2.in',
      });

      // Animate IN next word (slide up from bottom and fade in)
      gsap.to(next, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: 'back.out',
        delay: 0.1,
      });

      this.currentIndex = (this.currentIndex + 1) % els.length;
    }, 3000);
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }

  onJobSeeker(): void { this.router.navigate(['/signup']); }
  onEmployer(): void  { this.router.navigate(['/signup']); }
}