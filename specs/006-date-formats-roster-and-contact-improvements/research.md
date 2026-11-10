# Research & Technical Decisions: Date Formats, Roster Navigation & Volunteer Contacts

**Feature**: `006-date-formats-roster-and-contact-improvements`
**Date**: 2026-10-27
**Status**: Completed

## 1. Universal Date Formatting Standardization

- **Decision**: Standardize all date and timestamp renderings to the ISO 8601 `YYYY-MM-DD` format.
- **Rationale**:
  - `AdminTimeOffPage` previously rendered the requested date as `YYYY-MM-DD` while rendering `createdAt` via `toLocaleDateString()` which produced `DD/MM/YYYY` on European and UK system locales.
  - Using a uniform date helper `formatDate(val): string` ensures every date across the application (time-off requested dates, submission dates, arrival/departure dates, stay reviews, roster titles) renders in `YYYY-MM-DD`.
- **Alternatives Considered**:
  - *Full timestamp with time*: Unnecessary visual clutter for daily scheduling; `YYYY-MM-DD` provides clean, consistent scanning.

---

## 2. Monday-Snapping Date Picker & Week Navigation

- **Decision**:
  - When a date is selected in the weekly roster date picker, automatically snap it to the Monday of that week using `snapToMonday(dateStr)`.
  - Add navigation controls matching `AdminHeadcountPage`: `← Previous Week`, `This Week`, and `Next Week →` stepping by $\pm 7$ days.
  - Display the full weekly span in the header: `Monday, YYYY-MM-DD to Sunday, YYYY-MM-DD`.
- **Rationale**:
  - Native HTML `<input type="date">` does not support restricting choices to specific days of the week across browsers. Snapping upon selection immediately resolves any picked day to Monday without user calculation.
  - 1-click week navigation buttons eliminate the need to open the date calendar for routine weekly scheduling.
- **Alternatives Considered**:
  - *Custom week-picker calendar widget*: Heavy UI overhead; snapping plus 1-click week navigation delivers superior usability with zero extra dependencies.

---

## 3. Volunteer Contact Details Integration

- **Decision**:
  - Add dedicated input fields for `Email Address` and `Phone / WhatsApp Number` into `VolunteerModal.tsx`.
  - Display email and phone directly in the metadata section of volunteer cards on `AdminVolunteersPage.tsx` with active `mailto:` and `tel:` links.
- **Rationale**:
  - The SQLite database schema already defines `email` and `phone` columns on `volunteers`, and `volunteer-service.ts` already handles updating them.
  - Exposing these fields in the modal and cards allows coordinators to instantly contact volunteers and copy contact info for messaging.
