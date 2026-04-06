import { Pipe, PipeTransform } from '@angular/core';
import { formatDate } from '@angular/common';

@Pipe({
  name: 'appDate',
  standalone: true,
})
export class AppDatePipe implements PipeTransform {
  transform(value: string | Date | null | undefined, format = 'MMM yyyy', fallback = ''): string {
    if (!value) {
      return fallback;
    }

    if (value instanceof Date) {
      return Number.isNaN(value.getTime()) ? fallback : formatDate(value, format, 'en-US');
    }

    const normalizedValue = value.trim();
    if (!normalizedValue) {
      return fallback;
    }

    // Parse DateOnly values without timezone shift.
    const input = /^\d{4}-\d{2}-\d{2}$/.test(normalizedValue)
      ? `${normalizedValue}T00:00:00`
      : normalizedValue;

    const date = new Date(input);
    return Number.isNaN(date.getTime()) ? fallback : formatDate(date, format, 'en-US');
  }
}
