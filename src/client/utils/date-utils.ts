/**
 * Date utilities for consistent YYYY-MM-DD formatting and Monday-first week calculations.
 */

export function formatDate(input: string | Date | null | undefined): string {
  if (!input) return '';
  const d = typeof input === 'string' ? new Date(input) : input;
  if (isNaN(d.getTime())) return String(input);
  return d.toISOString().split('T')[0];
}

export function snapToMonday(input: string | Date): string {
  const d = typeof input === 'string' ? new Date(input) : new Date(input);
  const day = d.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff)).toISOString().split('T')[0];
}

export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export function getSunday(mondayStr: string): string {
  return addDays(mondayStr, 6);
}
