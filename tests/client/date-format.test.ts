import { describe, it, expect } from 'vitest';
import { formatDateWithPreference, formatDateWithDay } from '../../src/client/utils/date-utils.js';

describe('Date Formatting Utilities with Preference', () => {
  it('formats ISO date to DD-MM-YYYY when preference is DD-MM-YYYY', () => {
    expect(formatDateWithPreference('2026-11-09', 'DD-MM-YYYY')).toBe('09-11-2026');
    expect(formatDateWithPreference('2026-05-04', 'DD-MM-YYYY')).toBe('04-05-2026');
  });

  it('formats ISO date to YYYY-MM-DD when preference is YYYY-MM-DD', () => {
    expect(formatDateWithPreference('2026-11-09', 'YYYY-MM-DD')).toBe('2026-11-09');
  });

  it('formats with day name correctly', () => {
    const formatted = formatDateWithDay('2026-11-09', 'DD-MM-YYYY');
    expect(formatted).toContain('09-11-2026');
    expect(formatted.toLowerCase()).toContain('mon');
  });
});
