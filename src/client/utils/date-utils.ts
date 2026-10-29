/**
 * Date utilities for consistent YYYY-MM-DD formatting, Monday-first week calculations, and birthday alerts.
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

export interface BirthdayAlert {
  isUpcoming: boolean;
  daysUntil: number; // 0 = today, 1 = tomorrow ... 7 = in 7 days
  birthdayFormatted: string; // e.g. "Nov 3"
}

export function getBirthdayAlert(dob: string | null | undefined): BirthdayAlert | null {
  if (!dob) return null;
  const parts = dob.split('-');
  if (parts.length < 3) return null;

  const birthMonth = parseInt(parts[1], 10) - 1;
  const birthDay = parseInt(parts[2], 10);
  if (isNaN(birthMonth) || isNaN(birthDay)) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let candidate = new Date(today.getFullYear(), birthMonth, birthDay);
  candidate.setHours(0, 0, 0, 0);

  if (candidate < today) {
    candidate = new Date(today.getFullYear() + 1, birthMonth, birthDay);
    candidate.setHours(0, 0, 0, 0);
  }

  const diffMs = candidate.getTime() - today.getTime();
  const daysUntil = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (daysUntil >= 0 && daysUntil <= 7) {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return {
      isUpcoming: true,
      daysUntil,
      birthdayFormatted: `${monthNames[birthMonth]} ${birthDay}`
    };
  }

  return null;
}
