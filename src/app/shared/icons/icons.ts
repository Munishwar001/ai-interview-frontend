import { Component, Input } from '@angular/core';
import { NgSwitch, NgSwitchCase } from '@angular/common';

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [NgSwitch, NgSwitchCase],
  templateUrl: './icons.html',
  host: { '[class]': 'class' },
})
export class Icons {
  @Input() name!: string;
  /** Tailwind size classes, e.g. "w-4 h-4". Applied to the host element. */
  @Input() class = '';
}
