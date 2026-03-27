import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LandingpageHero } from './landingpage-hero/landingpage-hero';
import { LandingpageFeatures } from './landingpage-features/landingpage-features';
import { LandingpageTestimonials } from './landingpage-testimonials/landingpage-testimonials';
import { LandingpagePricing } from './landingpage-pricing/landingpage-pricing';
import { FooterComponent } from '../../shared/components/footer/footer.component';
@Component({
  selector: 'app-landingpage',
  standalone: true,
  imports: [CommonModule, LandingpageHero, LandingpageFeatures, LandingpageTestimonials, LandingpagePricing, FooterComponent],
  templateUrl: './landingpage.html',
  styleUrls: ['./landingpage.scss'],
})
export class Landingpage {

  constructor(private router: Router) {}

  onEmployer(): void {
    this.router.navigate(['/signup']);
  }

}