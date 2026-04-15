import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Icons } from '../../icons/icons';

@Component({
  selector: 'app-powered-badge',
  standalone: true,
  imports: [CommonModule, Icons],
  template: `
    <span class="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
      <app-icon name="sparkles" class="h-3.5 w-3.5 text-violet-500"></app-icon>
      {{ text || defaultText }}
    </span>
  `,
})
export class PoweredBadgeComponent {
  @Input() text = '';

  readonly defaultText = 'Powered by Advanced AI';
}
