import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
      [class.bg-green-100]="isActive"
      [class.text-green-700]="isActive"
      [class.bg-gray-100]="!isActive"
      [class.text-gray-500]="!isActive">
      <span class="w-1.5 h-1.5 rounded-full"
        [class.bg-green-500]="isActive"
        [class.bg-gray-400]="!isActive">
      </span>
      {{ status }}
    </span>
  `,
})
export class StatusBadge {
  @Input() status = '';

  get isActive(): boolean {
    return this.status?.toLowerCase() === 'active';
  }
}
