import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';

export interface LatLng { lat: number; lng: number; }

const markerIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
}

@Component({
  selector: 'app-map-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
    .search-dropdown { max-height: 180px; overflow-y: auto; }
  `],
  template: `
    <div class="space-y-2">

      <!-- Search Box -->
      <div class="relative">
        <div class="flex gap-2">
          <div class="relative flex-1">
            <svg class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none"
                 fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"/>
            </svg>
            <input
              [(ngModel)]="searchQuery"
              (ngModelChange)="onSearchInput()"
              (keydown.enter)="search()"
              type="text"
              placeholder="Search city, address..."
              class="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent"
            />
          </div>
          <button
            type="button"
            (click)="search()"
            [disabled]="isSearching"
            class="px-3 py-2 text-xs font-medium bg-violet-600 text-white rounded-xl hover:bg-violet-700 disabled:opacity-50 transition"
          >
            {{ isSearching ? '...' : 'Search' }}
          </button>
        </div>

        <!-- Suggestions Dropdown -->
        @if (suggestions.length > 0) {
          <div class="search-dropdown absolute z-[1000] top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg">
            @for (s of suggestions; track s.display_name) {
              <button
                type="button"
                (click)="selectSuggestion(s)"
                class="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition first:rounded-t-xl last:rounded-b-xl"
              >
                <span class="flex items-start gap-1.5">
                  <svg class="w-3 h-3 text-gray-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  </svg>
                  {{ s.display_name }}
                </span>
              </button>
            }
          </div>
        }
      </div>

      <!-- Map -->
      <div #mapContainer class="w-full h-56 rounded-xl border border-gray-200 overflow-hidden"></div>

      <!-- Selected location label -->
      @if (selectedAddress) {
        <p class="text-xs text-gray-500 flex items-center gap-1">
          <svg class="w-3.5 h-3.5 text-violet-500 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          {{ selectedAddress }}
        </p>
      } @else {
        <p class="text-xs text-gray-400">Search or click on the map to pick a location</p>
      }
    </div>
  `,
})
export class MapPickerComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapContainer') mapContainer!: ElementRef<HTMLDivElement>;
  @Input() initialLat = 20;
  @Input() initialLng = 0;
  @Input() zoom = 2;
  @Output() locationSelected = new EventEmitter<{ latlng: LatLng; address: string }>();

  private map!: L.Map;
  private marker?: L.Marker;
  private debounceTimer?: ReturnType<typeof setTimeout>;

  searchQuery = '';
  suggestions: SearchResult[] = [];
  isSearching = false;
  selectedAddress = '';

  ngAfterViewInit() {
    this.map = L.map(this.mapContainer.nativeElement, { zoomControl: true })
      .setView([this.initialLat, this.initialLng], this.zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(this.map);

    this.map.on('click', (e: L.LeafletMouseEvent) => this.onMapClick(e));
  }

  // Debounced auto-suggest as user types
  onSearchInput() {
    clearTimeout(this.debounceTimer);
    if (this.searchQuery.trim().length < 3) { this.suggestions = []; return; }
    this.debounceTimer = setTimeout(() => this.fetchSuggestions(), 400);
  }

  async fetchSuggestions() {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(this.searchQuery)}&format=json&limit=5`
      );
      this.suggestions = await res.json();
    } catch { this.suggestions = []; }
  }

  async search() {
    if (!this.searchQuery.trim()) return;
    this.isSearching = true;
    this.suggestions = [];
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(this.searchQuery)}&format=json&limit=5`
      );
      const results: SearchResult[] = await res.json();
      if (results.length > 0) this.selectSuggestion(results[0]);
    } catch { /* silent */ }
    this.isSearching = false;
  }

  selectSuggestion(s: SearchResult) {
    const lat = parseFloat(s.lat);
    const lng = parseFloat(s.lon);
    this.suggestions = [];
    this.searchQuery = '';
    this.placeMarker(lat, lng, s.display_name);
    this.map.setView([lat, lng], 12);
  }

  private async onMapClick(e: L.LeafletMouseEvent) {
    const { lat, lng } = e.latlng;
    this.suggestions = [];
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      const data = await res.json();
      const a = data.address;
      const address = [a.city || a.town || a.village || a.county, a.state, a.country]
        .filter(Boolean).join(', ');
      this.placeMarker(lat, lng, address);
    } catch {
      this.placeMarker(lat, lng, `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    }
  }

  private placeMarker(lat: number, lng: number, address: string) {
    if (this.marker) {
      this.marker.setLatLng([lat, lng]);
    } else {
      this.marker = L.marker([lat, lng], { icon: markerIcon }).addTo(this.map);
    }
    this.selectedAddress = address;
    this.locationSelected.emit({ latlng: { lat, lng }, address });
  }

  ngOnDestroy() {
    clearTimeout(this.debounceTimer);
    this.map?.remove();
  }
}
