import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Icons } from '../../shared/icons/icons';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, Icons],
  templateUrl: './not-found.html',
})
export class NotFoundComponent {

  dotArr = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  constructor(private router: Router) {}

  goHome(): void {
    this.router.navigate(['/']);
  }

  searchJobs(): void {
    this.router.navigate(['/jobs']);
  }
}