# Implementation Plan: Timeline Shading & Bed Count Capacity Adjustments

**Branch**: `016-timeline-shading-and-bed-counts` | **Date**: 2026-10-27 | **Spec**: [specs/016-timeline-shading-and-bed-counts/spec.md](spec.md)

## Summary
1. Update `src/server/routes/admin-timeline.ts` so `dailyConfirmedCounts` counts overnight bed demand (excluding volunteers on their departure date: `departureDate > date`).
2. Update `src/client/pages/AdminTimelinePage.tsx`:
   - Remove `'1'` and `'0'` text from cells.
   - For checkout day (`date === departureDate`), render lighter shade or hatched pattern.
   - For previous stay days, render intense solid color.
3. Update `tests/api/timeline.test.ts` to assert that volunteers are not counted on their departure date.

## Constitution Check
- **I. Test-First Engine & Invariants**: Overnight bed demand invariants verified in tests. **PASS**
- **II. Cultural Identity & High-Visibility Flags**: **PASS**
- **III. Self-Hosted Simplicity & Zero-Config**: **PASS**
- **IV. Human Override & Visual Highlighting**: Clear hatched pattern for checkout days. **PASS**
