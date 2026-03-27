import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Icons } from '../../icons/icons';

@Component({
  selector: 'app-testimonial-card',
  imports: [CommonModule, Icons],
  templateUrl: './testimonial-card.component.html',
  styleUrl: './testimonial-card.component.css',
})
export class TestimonialCardComponent {
  @Input() name: string = '';
  @Input() role: string = '';
  @Input() message: string = '';
  @Input() image: string = '';
}