import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { Icons } from '../../../shared/icons/icons';
interface NavLink {
  label: string;
  route: string;
  fragment: string;
}

@Component({
  selector: 'app-landing-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, Icons],
  templateUrl: './landing-layout.html',
  styleUrl: './landing-layout.scss',
})
export class LandingLayout {

  isDark = false;
  isMobileMenuOpen = false;

  navLinks: NavLink[] = [
    { label: 'Features',     route: '/', fragment: 'features'     },
    { label: 'Testimonials', route: '/', fragment: 'testimonials'  },
    { label: 'Pricing',      route: '/', fragment: 'pricing'       },
  ];

  constructor(private router: Router) {}

  toggleTheme(): void {
    this.isDark = !this.isDark;
    document.documentElement.classList.toggle('dark', this.isDark);
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  onSignIn(): void {
    this.closeMobileMenu();
    this.router.navigate(['/login']);
  }

  onGetStarted(): void {
    this.closeMobileMenu();
    this.router.navigate(['/signup']);
  }
}