# Implementation Plan: Hostel Operations, Staffing Timeline & Volunteer Management Enhancements

**Branch**: `011-operations-timeline-and-management` | **Date**: 2026-10-27 | **Spec**: [specs/011-operations-timeline-and-management/spec.md](spec.md)

**Input**: Feature specification from `specs/011-operations-timeline-and-management/spec.md`

## Summary

Implement operational upgrades requested by hostel management:
1. **Manual Rostering Guards**: Receptionist qualification filter, stay arrival/departure date boundary checks, and an over-allocation warning modal displaying current assigned hours with manager override.
2. **Volunteer Management & Stays**: Gender symbols (`♂`, `♀`, `⚧`, `⚪`), "No end date" support, Age display on cards, Departure modal (5-star rating, comments, 3-state rehire dropdown), colored rehire badges (`Accept`, `Possible`, `Don't Accept`), multi-stay history via `volunteer_stays`, "Re-activate" modal for returning volunteers, and multi-parameter filters.
3. **Staffing Timeline View**: New `/admin/timeline` view partitioned into Reception, Housekeeping, and Applied tiers with a 5+ week horizontal calendar grid, stay bars, and daily confirmed staff count row.
4. **Settings Upgrades**: Configurable headcount targets (Baseline, Low, Critical, Overbooked) and global date format preference (`YYYY-MM-DD` vs `DD-MM-YYYY`).
5. **Data Management**: Authenticated SQLite database backup download and historical CSV import CLI script (`scripts/import-historical-data.ts`).
6. **Volunteer Portal**: Day of the week name displayed alongside dates for upcoming shifts and time-off requests.

---

## Technical Context

**Language/Version**: Node.js (v22 LTS) & TypeScript 5.8+

**Primary Dependencies**: Fastify 5.x, React 19, Vite 8, Drizzle ORM, `country-flag-icons`

**Storage**: SQLite (`data/rostertool.sqlite`) with WAL mode

**Testing**: Vitest (`npm test`)

**Target Platform**: Self-hosted Linux container (Proxmox LXC / VM)

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle / Gate | Requirement | Architecture Compliance | Status |
|---|---|---|---|
| **I. Test-First Engine & Invariants** | Shift date boundaries and over-allocation guards must be validated with tests. | Engine and API tests written in `tests/api/` verifying stay bounds and role qualification. | **PASS** |
| **II. Cultural Identity & High-Visibility Flags** | Flags must be rendered adjacent to names across all views. | Timeline rows, volunteer cards, and modals include vector flags. | **PASS** |
| **III. Self-Hosted Simplicity & Zero-Config** | SQLite embedded storage without external services. | SQLite auto-migration in `client.ts`; backup downloads direct database file. | **PASS** |
| **IV. Human Override & Visual Highlighting** | Alerting over-allocation while permitting manager override; color badges on timeline and rehire status. | Confirmation modal allows shift override; timeline row highlights headcount health; rehire colored badges. | **PASS** |
| **V. Low-Friction Magic-Link Access** | Portal schedule readability improvements without login passwords. | Day name displayed next to shift dates in portal with zero friction. | **PASS** |

---

## Project Structure & File Roadmap

### Backend (`src/server/`)
- `src/server/db/schema.ts`:
  - Add `gender`, `source`, `noEndDate` to `volunteers` table.
  - Create `volunteerStays` table.
  - Add default headcount and date format keys to `systemSettings`.
- `src/server/db/client.ts`: Auto-migrate schema updates and seed `volunteer_stays` from existing active volunteers.
- `src/server/routes/admin-volunteers.ts`:
  - Add endpoints: `POST /:id/depart`, `POST /:id/reactivate`, `GET /:id/stays`.
  - Support gender, source, and noEndDate in volunteer create/update.
- `src/server/routes/admin-timeline.ts`: Implement `GET /api/admin/timeline` returning grouped tiers, 5+ weeks calendar days, and daily confirmed staff counts.
- `src/server/routes/admin-settings.ts`: Expand GET/POST to handle headcount thresholds and date format preference.
- `src/server/routes/admin-backup.ts`: Implement `GET /api/admin/backup/export` streaming database file.
- `src/server/routes/admin-roster.ts` & `src/server/services/roster-service.ts`:
  - Enforce stay date boundary guards in `assignShift`.
  - Include assigned hours in validation checks.
- `src/server/index.ts`: Register timeline and backup routes.

### Frontend (`src/client/`)
- `src/client/utils/date-utils.ts`:
  - Add `calculateAge(dob)` helper.
  - Add `formatDateWithDay(date, preference)` helper.
  - Support `DD-MM-YYYY` formatting option.
- `src/client/components/ShiftAssignModal.tsx`:
  - Strictly filter reception-qualified volunteers for reception shifts.
  - Check stay date bounds (disable out-of-range candidates).
  - Show over-allocation confirmation modal with current assigned hours vs target hours.
- `src/client/components/DepartureModal.tsx`: New modal for departure review (5-star rating, comments, 3-state rehire dropdown).
- `src/client/components/ReactivateModal.tsx`: New modal for re-activating returning volunteers with new stay dates.
- `src/client/components/StayHistoryModal.tsx`: New modal displaying historical stays and ratings.
- `src/client/pages/AdminVolunteersPage.tsx`:
  - Display gender symbols and calculated Age.
  - Render star ratings (★) and colored rehire badges on Departed cards.
  - Integrate departure, reactivate, and stay history modals.
  - Implement filters bar (rating, nationality, rehire eligibility, gender, dates).
- `src/client/pages/AdminTimelinePage.tsx`: New horizontal staffing timeline view matching `image.png`.
- `src/client/pages/AdminSettingsPage.tsx`:
  - Add Headcount Targets section (Baseline, Low, Critical, Overbooked).
  - Add Date Format Preference dropdown.
  - Add Data Backup download button.
- `src/client/pages/VolunteerPortalPage.tsx`:
  - Display day names alongside dates on upcoming shifts and time-off requests.
- `src/client/App.tsx`: Add "Timeline" link in top header and register `/admin/timeline` route.

### Scripts & Tests
- `scripts/import-historical-data.ts`: CLI migration script parsing CSV exported from legacy spreadsheet.
- `tests/api/timeline.test.ts`: Integration test for timeline endpoint and daily headcount aggregation.
- `tests/api/volunteers-stays.test.ts`: Integration test for multi-stay lifecycle, departure review, and re-activation.
- `tests/api/roster-guards.test.ts`: Integration test for stay date boundary validation and reception qualification filter.
