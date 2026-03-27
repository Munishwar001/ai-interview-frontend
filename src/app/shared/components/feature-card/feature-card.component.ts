import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Icons } from '../../icons/icons';

@Component({
  selector: 'app-feature-card',
  imports: [CommonModule, Icons],
  templateUrl: './feature-card.component.html',
  styleUrl: './feature-card.component.css',
})
export class FeatureCardComponent {
  @Input() icon: string = '';
  @Input() title: string = '';
  @Input() desc: string = '';
  @Input() iconBg: string = '';
}