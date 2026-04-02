import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-center justify-center py-10 text-center">
      <div class="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center mb-4">
        <ng-content select="[icon]"></ng-content>
      </div>
      <p class="text-sm font-medium text-gray-500">{{ title }}</p>
      <p *ngIf="subtitle" class="text-xs text-gray-400 mt-1">{{ subtitle }}</p>
    </div>
  `,
})
export class EmptyState {
  @Input() title = 'Nothing here yet';
  @Input() subtitle = '';
}
