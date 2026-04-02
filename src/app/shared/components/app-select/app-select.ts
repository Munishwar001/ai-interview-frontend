import { Component, Input, HostListener, signal, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlContainer, FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';

export interface SelectOption {
  value: any;
  label: string;
}

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div>
      <label class="block text-xs font-semibold text-gray-700 mb-1.5">
        {{ label }}
        @if (required) { <span class="text-red-500">*</span> }
      </label>

      <!-- View mode -->
      @if (!isEditing) {
        <div class="text-sm text-gray-900 py-2">{{ selectedLabel || 'Not set' }}</div>
      }

      <!-- Edit mode -->
      @if (isEditing) {
        <div class="relative">
          <!-- Trigger -->
          <button type="button" (click)="toggle()"
            class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg border text-sm text-left transition focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            [class.border-purple-500]="open()"
            [class.ring-2]="open()"
            [class.ring-purple-500]="open()"
            [class.border-gray-300]="!open()"
            [class.text-gray-900]="selectedLabel"
            [class.text-gray-400]="!selectedLabel">
            <span>{{ selectedLabel || placeholder }}</span>
            <svg class="w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0"
                 [class.rotate-180]="open()"
                 fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>

          <!-- Dropdown panel -->
          @if (open()) {
            <div class="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
              <!-- Search -->
              @if (searchable) {
                <div class="p-2 border-b border-gray-100">
                  <input #searchInput type="text" [(ngModel)]="searchQuery"
                    placeholder="Search..."
                    class="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"/>
                </div>
              }
              <ul class="max-h-52 overflow-y-auto py-1">
                @if (placeholder) {
                  <li (click)="select(null, '')"
                    class="px-3.5 py-2 text-sm text-gray-400 cursor-pointer hover:bg-gray-50 transition">
                    {{ placeholder }}
                  </li>
                }
                @for (opt of filteredOptions; track opt.value) {
                  <li (click)="select(opt.value, opt.label)"
                    class="flex items-center justify-between px-3.5 py-2 text-sm cursor-pointer transition"
                    [class.bg-purple-50]="isSelected(opt.value)"
                    [class.text-purple-700]="isSelected(opt.value)"
                    [class.font-semibold]="isSelected(opt.value)"
                    [class.text-gray-700]="!isSelected(opt.value)"
                    [class.hover:bg-gray-50]="!isSelected(opt.value)">
                    {{ opt.label }}
                    @if (isSelected(opt.value)) {
                      <svg class="w-3.5 h-3.5 text-purple-600 shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                      </svg>
                    }
                  </li>
                }
                @if (filteredOptions.length === 0) {
                  <li class="px-3.5 py-3 text-xs text-gray-400 text-center">No options found</li>
                }
              </ul>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class AppSelect {
  @Input() label = '';
  @Input() controlName!: string;
  @Input() placeholder = 'Select...';
  @Input() options: SelectOption[] = [];
  @Input() isEditing = true;
  @Input() required = false;
  @Input() searchable = false;

  open = signal(false);
  searchQuery = '';

  constructor(@Optional() private controlContainer: ControlContainer) {}

  get control(): FormControl {
    return this.controlContainer?.control?.get(this.controlName) as FormControl;
  }

  get selectedLabel(): string {
    const val = this.control?.value;
    if (val === null || val === undefined || val === '') return '';
    return this.options.find(o => String(o.value) === String(val))?.label ?? '';
  }

  get filteredOptions(): SelectOption[] {
    if (!this.searchQuery.trim()) return this.options;
    const q = this.searchQuery.toLowerCase();
    return this.options.filter(o => o.label.toLowerCase().includes(q));
  }

  isSelected(value: any): boolean {
    return String(this.control?.value) === String(value);
  }

  toggle() { this.open.update(v => !v); }

  select(value: any, label: string) {
    this.control?.setValue(value);
    this.control?.markAsTouched();
    this.open.set(false);
    this.searchQuery = '';
  }

  @HostListener('document:click', ['$event'])
  onOutsideClick(e: MouseEvent) {
    if (!(e.target as HTMLElement).closest('app-select')) {
      this.open.set(false);
    }
  }
}
