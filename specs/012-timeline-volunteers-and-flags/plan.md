# Implementation Plan: Timeline View Volunteer-Only Scope & Country Column Removal

**Branch**: `012-timeline-volunteers-and-flags` | **Date**: 2026-10-27 | **Spec**: [specs/012-timeline-volunteers-and-flags/spec.md](spec.md)

**Input**: Feature specification from `specs/012-timeline-volunteers-and-flags/spec.md`

## Summary

Deliver two timeline adjustments:
1. **Scope Fix**: Remove permanent paid staff (`staff_users`) from `/api/admin/timeline` and the client UI, restricting all tiers and daily confirmed counts exclusively to volunteers.
2. **Layout Streamlining & SVG Flag Compliance**: Remove the separate "Country" column to save horizontal space and display authentic SVG vector flags (`CountryFlag`) directly adjacent to volunteer names, strictly satisfying Constitution Principle II.

---

## Technical Context

**Language/Version**: Node.js (v22 LTS) & TypeScript 5.8+

**Primary Dependencies**: Fastify 5.x, React 19, Vite 8, `country-flag-icons`

**Storage**: SQLite (`data/rostertool.sqlite`)

**Testing**: Vitest (`npm test`)

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle / Gate | Requirement | Architecture Compliance | Status |
|---|---|---|---|
| **I. Test-First Engine & Invariants** | Timeline aggregation logic must only count confirmed volunteers. | Verified in `tests/api/timeline.test.ts`. | **PASS** |
| **II. Cultural Identity & High-Visibility Flags** | Authentic SVG vector flags must be displayed adjacent to names; bare text abbreviations prohibited. | Column B in `AdminTimelinePage.tsx` displays `<CountryFlag countryCode={...} />` adjacent to name. Redundant text column removed. | **PASS** |
| **III. Self-Hosted Simplicity & Zero-Config** | No external dependencies or external icon CDNs. | Uses embedded `country-flag-icons` SVG components. | **PASS** |
| **IV. Human Override & Visual Highlighting** | Timeline provides clear visual identification of volunteer stays. | Retains distinct bar colors and status badges. | **PASS** |
| **V. Low-Friction Magic-Link Access** | Portal links remain untouched. | Unchanged. | **PASS** |

---

## Project Structure & File Roadmap

### Backend (`src/server/`)
- `src/server/routes/admin-timeline.ts`:
  - Remove query to `staffUsers`.
  - Exclude staff from `reception`, `housekeeping`, and `dailyConfirmedCounts`.
- `tests/api/timeline.test.ts`:
  - Update integration test to verify paid staff (`staffUsers`) are NOT included in timeline response and confirmed counts only reflect on-site volunteers.

### Frontend (`src/client/`)
- `src/client/pages/AdminTimelinePage.tsx`:
  - Remove Column C ("Country") header and cell from the timeline table.
  - Update the ColSpan of the "Personnel Details" header from 8 to 7.
  - Update the ColSpan of section rows ("Reception", "Housekeeping", "Total CONFIRMED Volunteers", "Applied") from `8 + days.length` to `7 + days.length`.
  - Ensure Column B ("Name") displays `<CountryFlag countryCode={person.nationality} />` immediately adjacent to the volunteer's name.
  - Update summary row label to "Total CONFIRMED Volunteers".
