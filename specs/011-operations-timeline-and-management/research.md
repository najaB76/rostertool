# Research & Technical Decisions: Operations, Timeline & Volunteer Management

**Feature**: `011-operations-timeline-and-management`
**Date**: 2026-10-27
**Status**: Completed

## 1. Multi-Stay Architecture for Repeat Volunteers

- **Decision**: Introduce a `volunteer_stays` table linked by foreign key to `volunteers`, while maintaining active stay denormalization on `volunteers` (`arrivalDate`, `departureDate`, `noEndDate`) for fast rostering lookups.
- **Rationale**:
  - Repeat volunteers return across multiple seasons.
  - Historical ratings, departure comments, and rehire status should be tied to specific stay records so performance trends can be tracked.
  - Keeping active stay dates directly accessible on the `volunteers` record avoids complex joins in high-frequency scheduling and auto-population loops while giving full history access via `volunteer_stays`.
- **Alternatives Considered**:
  - *Storing stay history purely as JSON in `volunteers`*: Harder to query date ranges for historical reporting.
  - *Moving all dates solely into `volunteer_stays`*: Would require rewriting all existing queries that read `arrivalDate` / `departureDate` across the engine and solver. Hybrid approach ensures backward compatibility and zero solver regressions.

---

## 2. Staffing Timeline View Implementation Pattern

- **Decision**: Implement `/admin/timeline` using a CSS Grid / Flex calendar layout modeled after `image.png` (`STAFF.ods`), segregated into Reception, Housekeeping, and Applied tiers.
- **Rationale**:
  - A table with fixed left columns (Gender, Preferred Name, Country, Age, Source, Status, Arrival, Departure) and a horizontally scrollable date grid provides optimal readability.
  - Daily confirmed staff count row at the boundary calculates on-site headcount dynamically with color badges corresponding to the configurable headcount targets (Green = Target, Yellow = Low, Red = Critical/Overbooked).
  - Procedural color assignment (derived from volunteer ID hash or rotating palette) ensures consistent, distinctive horizontal stay bars without manual color picking.
- **Alternatives Considered**:
  - *Canvas-based timeline*: Overkill for a 5–8 week grid; lacks DOM accessibility and easy tooltips.
  - *Third-party Gantt library*: Heavy dependencies that clash with zero-config lightweight UI mandate.

---

## 3. Shift Assignment Guards & Over-Allocation Dialog

- **Decision**:
  - Filter `isReceptionQualified === true` in `ShiftAssignModal` candidate list for reception shifts.
  - Validate shift date against volunteer arrival/departure dates both in client `ShiftAssignModal` and backend `rosterService.assignShift`.
  - When assigning a volunteer who has already accumulated $\ge 16$ weekly assigned hours (or target shifts), trigger a confirmation dialog:
    *"[Name] already has [X] assigned hours this week (target: [Y]h). Confirm additional assignment?"* with **Confirm** and **Cancel** buttons.
- **Rationale**:
  - Honors Principle IV (Human-in-the-Loop Override): Alerting managers of over-allocation while still allowing manual override allows volunteers to recover hours missed from previous weeks.
  - Strictly blocking dates outside stay boundaries eliminates impossible assignments.

---

## 4. Configurable Headcount Targets & Global Date Formatting

- **Decision**:
  - Store headcount thresholds and date format preference in SQLite `system_settings` table.
  - Provide a React `DatePreferenceContext` (or centralized helper) that formats dates according to `'YYYY-MM-DD'` or `'DD-MM-YYYY'`.
  - Backend and database storage remain strictly ISO `YYYY-MM-DD` to prevent SQL comparison anomalies.
- **Rationale**:
  - Headcount thresholds vary by season. Centralizing them in Settings powers both the `/admin/headcount` view and the new `/admin/timeline` view.
  - Standardizing display formatting via helper functions maintains full type safety and keeps database queries simple.

---

## 5. Data Backup Export & Historical Import CLI Script

- **Decision**:
  - Backup Export: An authenticated endpoint `GET /api/admin/backup/export` that returns a downloadable SQLite database binary snapshot or JSON dump.
  - Historical Import: A standalone TypeScript script `scripts/import-historical-data.ts` executed via `npm run import:history -- <path-to-csv>` that parses CSV exported from `STAFF.ods` and inserts volunteer records with their stay dates.
- **Rationale**:
  - One-time historical import doesn't clutter the production web UI and handles large legacy spreadsheets cleanly.
  - SQLite snapshot backup allows instant full disaster recovery with zero complex database dumping tools.

---

## 6. Volunteer Portal Day-of-Week Labeling

- **Decision**: Update `VolunteerPortalPage.tsx` to format shift and time-off request dates with day names: `${dayOfWeek}, ${formattedDate}` (e.g. `Monday, 2026-11-09`).
- **Rationale**:
  - Volunteers check their schedule on mobile devices; knowing the day of the week at a glance prevents scheduling confusion.
