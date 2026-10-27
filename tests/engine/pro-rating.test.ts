import { describe, it, expect } from 'vitest';
import { calculateProratedHours } from '../../src/engine/pro-rate.js';

describe('Pro-Rating Calculator', () => {
  it('returns full target hours if staying entire week', () => {
    // Week is Mon 2026-10-26 to Sun 2026-11-01
    const hours = calculateProratedHours('2026-10-26', '2026-11-01', '2026-10-01', '2026-11-30', 16);
    expect(hours).toBe(16);
  });

  it('pro-rates correctly for a mid-week arrival', () => {
    // Arrival on Thursday (2026-10-29). Available Thu, Fri, Sat, Sun = 4 days.
    // 4 / 7 * 16 = 9.14 => rounded to 9 (or 8 depending on logic, let's say round to nearest int)
    const hours = calculateProratedHours('2026-10-26', '2026-11-01', '2026-10-29', '2026-11-30', 16);
    expect(Math.round(hours)).toBe(9); // 4/7 of 16 is ~9.14
  });

  it('pro-rates correctly for mid-week departure', () => {
    // Departure on Wednesday (2026-10-28). Available Mon, Tue, Wed = 3 days.
    // 3 / 7 * 16 = 6.85 => rounded to 7
    const hours = calculateProratedHours('2026-10-26', '2026-11-01', '2026-10-01', '2026-10-28', 16);
    expect(Math.round(hours)).toBe(7);
  });

  it('returns 0 if completely outside stay dates', () => {
    const hours = calculateProratedHours('2026-10-26', '2026-11-01', '2026-11-05', '2026-11-30', 16);
    expect(hours).toBe(0);
  });
});
