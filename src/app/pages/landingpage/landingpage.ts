import { Component ,AfterViewInit  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Icons } from '../../shared/icons/icons';
import { LandingpageHero } from './landingpage-hero/landingpage-hero';
import { LandingpageFeatures } from './landingpage-features/landingpage-features';
import { LandingpageTestimonials } from './landingpage-testimonials/landingpage-testimonials';
import { LandingpagePricing } from './landingpage-pricing/landingpage-pricing';
@Component({
  selector: 'app-landingpage',
  standalone: true,
  imports: [CommonModule, Icons ,LandingpageHero ,LandingpageFeatures ,LandingpageTestimonials ,LandingpagePricing],
  templateUrl: './landingpage.html',
  styleUrls: ['./landingpage.scss'],
})
export class Landingpage {

  constructor(private router: Router) {}

  onEmployer(): void {
    this.router.navigate(['/signup']);
  }

}