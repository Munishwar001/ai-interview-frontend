import {
  Component, Input, Output, EventEmitter,
  HostListener, signal, OnChanges, SimpleChanges, OnInit, effect
} from '@angular/core';
import { CommonModule } from '@angular/common';

// Shared active picker ID — only one open at a time
const activePicker = signal<string | null>(null);
let pickerIdCounter = 0;

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative">
      <label *ngIf="label" class="block text-xs font-medium text-gray-600 mb-1">{{ label }}</label>

      <!-- Trigger -->
      <button type="button" (click)="toggle()"
        class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg border text-sm text-left transition focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent"
        [class.border-violet-400]="open()"
        [class.ring-2]="open()"
        [class.ring-violet-400]="open()"
        [class.border-gray-200]="!open()"
        [class.text-gray-900]="displayValue"
        [class.text-gray-400]="!displayValue">
        <span class="flex items-center gap-2">
          <svg class="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
          {{ displayValue || placeholder }}
        </span>
        <svg class="w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0"
             [class.rotate-180]="open()"
             fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
        </svg>
      </button>

      <!-- Dropdown -->
      @if (open()) {
        <div class="absolute z-50 mt-1 w-72 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">

          <!-- Header: year + month nav -->
          <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <button type="button" (click)="prev()"
              class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>

            <button type="button" (click)="toggleView()"
              class="text-sm font-semibold text-gray-800 hover:text-violet-600 transition">
              {{ viewMode() === 'days' ? monthYearLabel() : viewYear() }}
            </button>

            <button type="button" (click)="next()" [disabled]="isNextDisabled()"
              class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition disabled:opacity-30">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>

          <!-- Month view -->
          @if (viewMode() === 'months') {
            <div class="grid grid-cols-3 gap-1 p-3">
              @for (m of months; track m.index) {
                <button type="button" (click)="selectMonth(m.index)"
                  [disabled]="isMonthDisabled(m.index)"
                  class="py-1.5 rounded-lg text-xs font-medium transition"
                  [class.bg-violet-600]="isMonthSelected(m.index)"
                  [class.text-white]="isMonthSelected(m.index)"
                  [class.text-gray-700]="!isMonthSelected(m.index) && !isMonthDisabled(m.index)"
                  [class.hover:bg-violet-50]="!isMonthSelected(m.index) && !isMonthDisabled(m.index)"
                  [class.hover:text-violet-700]="!isMonthSelected(m.index) && !isMonthDisabled(m.index)"
                  [class.text-gray-300]="isMonthDisabled(m.index)"
                  [class.cursor-not-allowed]="isMonthDisabled(m.index)">
                  {{ m.short }}
                </button>
              }
            </div>
          }

          <!-- Day view -->
          @if (viewMode() === 'days') {
            <div class="p-3">
              <!-- Day-of-week headers -->
              <div class="grid grid-cols-7 mb-1">
                @for (d of dayHeaders; track d) {
                  <div class="text-center text-xs text-gray-400 font-medium py-1">{{ d }}</div>
                }
              </div>
              <!-- Day cells -->
              <div class="grid grid-cols-7 gap-0.5">
                @for (cell of dayCells(); track cell.key) {
                  <button type="button"
                    [disabled]="cell.disabled || !cell.day"
                    (click)="cell.day && !cell.disabled && selectDay(cell.day)"
                    class="h-8 w-full rounded-lg text-xs transition"
                    [class.invisible]="!cell.day"
                    [class.bg-violet-600]="cell.selected"
                    [class.text-white]="cell.selected"
                    [class.font-semibold]="cell.selected"
                    [class.text-gray-700]="!cell.selected && !cell.disabled && cell.day"
                    [class.hover:bg-violet-50]="!cell.selected && !cell.disabled && cell.day"
                    [class.text-gray-300]="cell.disabled && cell.day"
                    [class.cursor-not-allowed]="cell.disabled">
                    {{ cell.day || '' }}
                  </button>
                }
              </div>
            </div>
          }

          <!-- Clear -->
          @if (displayValue) {
            <div class="px-3 pb-3 border-t border-gray-100 pt-2">
              <button type="button" (click)="clear()"
                class="w-full py-1.5 text-xs text-red-500 hover:bg-red-50 rounded-lg transition">
                Clear date
              </button>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class DatePickerComponent implements OnChanges, OnInit {
  @Input() label = '';
  @Input() placeholder = 'Select date';
  @Input() value = '';
  @Output() valueChange = new EventEmitter<string>();

  open = signal(false);
  viewYear = signal(new Date().getFullYear());
  viewMonth = signal(new Date().getMonth());
  viewMode = signal<'months' | 'days'>('months');
  private pickerId = '';

  readonly months = [
    { short: 'Jan', index: 0 }, { short: 'Feb', index: 1 }, { short: 'Mar', index: 2 },
    { short: 'Apr', index: 3 }, { short: 'May', index: 4 }, { short: 'Jun', index: 5 },
    { short: 'Jul', index: 6 }, { short: 'Aug', index: 7 }, { short: 'Sep', index: 8 },
    { short: 'Oct', index: 9 }, { short: 'Nov', index: 10 }, { short: 'Dec', index: 11 },
  ];

  readonly dayHeaders = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  ngOnInit() {
    this.pickerId = `dp-${++pickerIdCounter}`;
    effect(() => {
      const active = activePicker();
      if (active !== null && active !== this.pickerId) this.open.set(false);
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['value'] && this.value) {
      const d = new Date(this.value + 'T00:00:00');
      if (!isNaN(d.getTime())) {
        this.viewYear.set(d.getFullYear());
        this.viewMonth.set(d.getMonth());
      }
    }
  }

  get displayValue(): string {
    if (!this.value) return '';
    const d = new Date(this.value + 'T00:00:00');
    if (isNaN(d.getTime())) return '';
    return `${this.months[d.getMonth()].short} ${d.getDate()}, ${d.getFullYear()}`;
  }

  monthYearLabel(): string {
    return `${this.months[this.viewMonth()].short} ${this.viewYear()}`;
  }

  dayCells(): { day: number | null; disabled: boolean; selected: boolean; key: string }[] {
    const year = this.viewYear();
    const month = this.viewMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    const cells: { day: number | null; disabled: boolean; selected: boolean; key: string }[] = [];

    // Leading empty cells
    for (let i = 0; i < firstDay; i++) cells.push({ day: null, disabled: false, selected: false, key: `e${i}` });

    for (let d = 1; d <= daysInMonth; d++) {
      const cellDate = new Date(year, month, d);
      const disabled = cellDate > today;
      const selected = this.value === `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({ day: d, disabled, selected, key: `d${d}` });
    }
    return cells;
  }

  isMonthSelected(m: number): boolean {
    if (!this.value) return false;
    const d = new Date(this.value + 'T00:00:00');
    return d.getFullYear() === this.viewYear() && d.getMonth() === m;
  }

  isMonthDisabled(m: number): boolean {
    const now = new Date();
    return this.viewYear() > now.getFullYear() ||
      (this.viewYear() === now.getFullYear() && m > now.getMonth());
  }

  isNextDisabled(): boolean {
    const now = new Date();
    if (this.viewMode() === 'months') return this.viewYear() >= now.getFullYear();
    return this.viewYear() >= now.getFullYear() && this.viewMonth() >= now.getMonth();
  }

  toggleView() {
    this.viewMode.update(v => v === 'days' ? 'months' : 'days');
  }

  prev() {
    if (this.viewMode() === 'months') {
      this.viewYear.update(y => y - 1);
    } else {
      if (this.viewMonth() === 0) { this.viewYear.update(y => y - 1); this.viewMonth.set(11); }
      else this.viewMonth.update(m => m - 1);
    }
  }

  next() {
    if (this.isNextDisabled()) return;
    if (this.viewMode() === 'months') {
      this.viewYear.update(y => y + 1);
    } else {
      if (this.viewMonth() === 11) { this.viewYear.update(y => y + 1); this.viewMonth.set(0); }
      else this.viewMonth.update(m => m + 1);
    }
  }

  selectMonth(m: number) {
    if (this.isMonthDisabled(m)) return;
    this.viewMonth.set(m);
    this.viewMode.set('days');
  }

  selectDay(day: number) {
    const iso = `${this.viewYear()}-${String(this.viewMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    this.valueChange.emit(iso);
    this.open.set(false);
    activePicker.set(null);
  }

  toggle() {
    const isOpen = this.open();
    activePicker.set(isOpen ? null : this.pickerId);
    this.open.set(!isOpen);
  }

  clear() {
    this.valueChange.emit('');
    this.open.set(false);
    activePicker.set(null);
  }

  @HostListener('document:click', ['$event'])
  onOutside(e: MouseEvent) {
    if (!(e.target as HTMLElement).closest('app-date-picker')) {
      this.open.set(false);
      activePicker.set(null);
    }
  }
}
