# Research & Technical Decisions: Timeline Shading & Bed Count Capacity Adjustments

**Feature**: `016-timeline-shading-and-bed-counts`
**Date**: 2026-10-27
**Status**: Completed

## 1. Visual Shading for Timeline Stay Bars

- **Decision**:
  - Remove all text (`'1'`, `'0'`) from stay cells.
  - For normal stay days ($arrivalDate \le date < departureDate$, or when $noEndDate$): use solid intense bar color.
  - For the final departure day ($date === departureDate$ when not open-ended): use a distinct hatched/striped pattern via CSS `repeating-linear-gradient(45deg, ${barColor}, ${barColor} 5px, rgba(255,255,255,0.7) 5px, rgba(255,255,255,0.7) 10px)` or a lighter pastel tint (`opacity: 0.45` or lighter background).
- **Rationale**:
  - Eliminates spreadsheet formula clutter.
  - Hatched diagonal stripes on checkout day instantly communicate that the volunteer departs on that date.

## 2. Bed Demand Calculation (Nightly Overnight Bed Count)

- **Decision**:
  - In `src/server/routes/admin-timeline.ts`, update `dailyConfirmedCounts[day.date]` to check `v.arrivalDate <= day.date && (v.noEndDate || !v.departureDate || v.departureDate > day.date)`.
- **Rationale**:
  - The daily count row represents bed demand in the staff bedroom overnight.
  - A volunteer departing on date $D$ vacates their bed during checkout hours and does not need a bed on the night of $D$.
  - Therefore, on their departure date ($date = departureDate$), they must NOT be counted in the overnight total.
