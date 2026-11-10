# Research & Technical Decisions: Assignment Modal, Country Search & Multi-Day Time-Off

**Feature**: `004-roster-assignment-and-timeoff-improvements`
**Date**: 2026-10-27
**Status**: Completed

## 1. Interactive Shift Assignment Modal

- **Decision**: Create a dedicated React component `src/client/components/ShiftAssignModal.tsx` that replaces `window.prompt` dialogs.
- **Rationale**:
  - `window.prompt` required entering arbitrary IDs and letters ('v'/'s') manually, which was error-prone and unintuitive.
  - The modal receives shift context (`shiftDefinitionId`, `date`, `shiftName`, `durationHours`) and active volunteer/staff data.
  - Candidates are rendered in a structured list displaying their name, vector country flag, primary role, qualifications, current scheduled hours for the week, and conflict indicators (e.g. approved time-off or double-booking).
  - Clicking any candidate sends `POST /api/admin/roster/assign` and updates the grid in 1 click.
- **Alternatives Considered**:
  - *Inline dropdown inside every cell*: Clutters small cells and slows down rendering of 21+ cells on the grid.

---

## 2. Complete 250+ Country/Territory Dataset with Searchable Select

- **Decision**:
  - Provide a full canonical catalog of all 266 countries and territories supported by `country-flag-icons` in `src/client/data/countries.ts`, including all Caribbean nations (Jamaica `JM`, Barbados `BB`, Bahamas `BS`, Curaçao `CW`, Aruba `AW`, Trinidad and Tobago `TT`, Puerto Rico `PR`, Cayman Islands `KY`, Cuba `CU`, Dominican Republic `DO`, Saint Lucia `LC`, Grenada `GD`, Saint Vincent `VC`, Antigua and Barbuda `AG`, Saint Kitts and Nevis `KN`, Dominica `DM`, Haiti `HT`, Martinique `MQ`, Guadeloupe `GP`, Bermuda `BM`, Turks and Caicos `TC`, British Virgin Islands `VG`, US Virgin Islands `VI`).
  - Upgrade `CountrySelect.tsx` into a custom searchable select component with a text filter input, keyboard navigation, and scrollable list with vector flags.
- **Rationale**:
  - Standard HTML `<select>` cannot render custom vector SVG elements inside `<option>` on most operating systems, nor does it allow typing-based search filtering on mobile or custom keyboards.
  - A lightweight custom dropdown allows typing "Jam" to immediately filter to "🇯🇲 Jamaica (JM)".
- **Alternatives Considered**:
  - *External multi-select library (e.g. react-select)*: Heavy bundle footprint; a clean custom vanilla React searchable select is under 80 lines and has zero runtime dependencies.

---

## 3. Multi-Day Time-Off Requests

- **Decision**:
  - Enhance `TimeOffModal.tsx` with a date range selector: `Start Date` and `End Date` (inclusive).
  - Backend `POST /api/portal/time-off` accepts `{ startDate, endDate, reason }`, expands the range into individual calendar dates, and creates a `time_off_requests` record for each date.
  - When the manager approves or denies in `admin-timeoff.ts`, consecutive requests sharing the same volunteer and reason can be approved individually or in batch.
- **Rationale**:
  - Volunteers commonly take trips lasting 2 to 5 days (e.g. Friday through Monday). Submitting a single range is 5x faster than submitting multiple separate single-day requests.
- **Alternatives Considered**:
  - *Storing ranges directly as single rows with start_date and end_date*: Would require altering foreign keys and rewriting the constraint solver which queries date-by-date (`to.date === shift.date`). Creating date records internally maintains 100% compatibility with the existing solver and database queries while giving volunteers a seamless date-range UI!
