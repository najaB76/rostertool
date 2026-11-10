# Research & Technical Decisions: Timeline Volunteers Scope & SVG Flag Enforcement

**Feature**: `012-timeline-volunteers-and-flags`
**Date**: 2026-10-27
**Status**: Completed

## 1. Exclusion of Paid Staff from Timeline Architecture

- **Decision**: Remove `staffUsers` queries from `/api/admin/timeline` and restrict the timeline dataset strictly to the `volunteers` table (`Active`, `Accepted`, and `Applied`).
- **Rationale**:
  - The staffing timeline is a visual capacity planning tool for managing volunteer stays, turnover, and arrivals/departures.
  - Permanent paid staff do not have turnover or volunteer departure dates; including them artificially inflated the "Total Confirmed Staff Members" count and cluttered volunteer horizon planning.
  - Paid staff remain fully managed in the Weekly Roster (`/admin/roster`) and Staff Management (`/admin/staff`) sections.
- **Alternatives Considered**:
  - *Adding a filter toggle for staff*: Adds unnecessary UI complexity when management explicitly requested that the timeline only include volunteers.

---

## 2. Constitution Principle II SVG Flag Enforcement

- **Decision**: In `AdminTimelinePage.tsx`, import `COUNTRIES` from `src/client/data/countries.ts` and ensure all country displays prominently feature the SVG vector flag component (`<CountryFlag countryCode={...} />`) accompanied by the full country name.
- **Rationale**:
  - Constitution Principle II explicitly mandates:
    *"Render authentic national flags using SVG/vector flag icons (via country-flag-icons) directly adjacent to every volunteer's name... Never substitute text abbreviations or plain emojis for verified SVG flags in core rostering cards or headers."*
  - Displaying bare two-letter codes (e.g. `GB` or `NL`) without SVG flags or using abbreviations in place of flags directly violates this non-negotiable principle.
  - Providing the flag alongside the country name (e.g. `[Flag] United Kingdom (GB)`) maximizes clarity and visual aesthetics.
- **Alternatives Considered**:
  - *Showing only the 2-letter code in column C*: Violates Constitution Principle II.
  - *Showing only the flag without text*: Less readable when scrolling quickly; combining the SVG flag with the localized country name provides the best UX.
