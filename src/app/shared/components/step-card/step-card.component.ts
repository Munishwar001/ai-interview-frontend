import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Icons } from '../../icons/icons';

@Component({
  selector: 'app-step-card',
  imports: [CommonModule, Icons],
  templateUrl: './step-card.component.html',
})
export class StepCardComponent {
  @Input() icon: string = '';
  @Input() title: string = '';
  @Input() desc: string = '';
  @Input() index: number = 0;
}