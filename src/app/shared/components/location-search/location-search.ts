import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface LocationResult {
  display_name: string;
  address: {
    city?: string; town?: string; village?: string; county?: string;
    state?: string; country?: string; postcode?: string;
  };
}

@Component({
  selector: 'app-location-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative">
      <div class="flex gap-2">
        <div class="relative flex-1">
          <svg class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none"
               fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          <input
            [(ngModel)]="query"
            (ngModelChange)="onInput()"
            (keydown.escape)="clear()"
            type="text"
            placeholder="Search city, address..."
            class="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent"
          />
          @if (loading()) {
            <svg class="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 animate-spin"
                 fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
          }
        </div>
      </div>

      @if (results().length > 0) {
        <div class="absolute z-50 top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden max-h-52 overflow-y-auto">
          @for (r of results(); track r.display_name) {
            <button type="button" (click)="select(r)"
              class="w-full text-left px-3 py-2.5 text-xs text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition flex items-start gap-2 border-b border-gray-50 last:border-0">
              <svg class="w-3 h-3 text-gray-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              </svg>
              {{ r.display_name }}
            </button>
          }
        </div>
      }
    </div>
  `,
})
export class LocationSearch {
  @Output() locationSelected = new EventEmitter<{ address: string; structured: LocationResult['address'] }>();

  query = '';
  results = signal<LocationResult[]>([]);
  loading = signal(false);
  private timer?: ReturnType<typeof setTimeout>;

  onInput() {
    clearTimeout(this.timer);
    if (this.query.trim().length < 2) { this.results.set([]); return; }
    this.loading.set(true);
    this.timer = setTimeout(() => this.search(), 350);
  }

  private async search() {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(this.query)}&format=json&addressdetails=1&limit=6`
      );
      this.results.set(await res.json());
    } catch { this.results.set([]); }
    this.loading.set(false);
  }

  select(r: LocationResult) {
    this.query = r.display_name;
    this.results.set([]);
    this.locationSelected.emit({ address: r.display_name, structured: r.address });
  }

  clear() { this.results.set([]); }
}
