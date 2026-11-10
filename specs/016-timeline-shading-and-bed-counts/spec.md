# Feature Specification: Timeline Shading & Bed Count Capacity Adjustments

**Feature Branch**: `016-timeline-shading-and-bed-counts`

**Created**: 2026-10-27

**Status**: Draft

**Input**: User feedback: "FIX: Two issues wit the timeline chart - 1. The '1' and '0' in the cells was only used to drive the spreadsheet totals; 2. The total is used to count how many beds are needed in the staff room, the volunteer doesn't need a bed for the night that they leave so don't them in total on the last day of their stay. - Resolution: do not display the '1' and '0' but instead use a more intense shading of the bar for the main part of their stay and a lighter or hatched colour for their last day. Do not inlcude their last day in the Total confirmed volunteers count."

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Remove Cell Numbers & Implement Distinct Departure Day Shading (Priority: P1)

As a hostel manager viewing the Staffing Timeline, I want the timeline bar cells to display pure color bars without any literal text '1' or '0' characters, with the main part of a volunteer's stay rendered in a rich solid color and their final departure day rendered in a lighter or hatched pattern, so that the timeline is clean, visually intuitive, and immediately distinguishes checkout days from full-stay nights.

**Why this priority**: In the original spreadsheet, '1' and '0' numbers were formula artifacts. On a web app, numbers clutter the grid and distract from the visual schedule. Distinguishing the final departure day with a lighter/hatched pattern provides clear visual feedback of turnover.

**Independent Test**:
- Open `/admin/timeline`.
- Inspect any volunteer's stay bar across the calendar grid.
- Verify that **no** '1' or '0' text appears inside the calendar cells.
- Verify that days from arrival date up to the day before departure render in a solid vibrant color.
- Verify that on the departure date, the cell renders in a distinct lighter shade or hatched pattern.

**Acceptance Scenarios**:
1. **Given** any active, accepted, or applied stay bar on the timeline, **When** rendered, **Then** all cells contain no literal '1' or '0' text characters.
2. **Given** a volunteer whose stay ends on date $D_{dep}$, **When** viewing the bar on date $D_{dep}$, **Then** the cell renders with lighter or hatched styling indicating departure day.
3. **Given** days prior to $D_{dep}$, **When** viewing the bar, **Then** cells render in the solid intense base color.

---

### User Story 2 - Bed Demand Counting Excludes Departure Day from Daily Totals (Priority: P1)

As a hostel manager monitoring staff room capacity, I want the "Total CONFIRMED Volunteers" daily count to represent actual bed demand for each night, excluding volunteers on the day they depart, so that the total accurately reflects how many beds are needed in the staff room overnight.

**Why this priority**: A volunteer departing on date $D$ vacates their bed during the day and does not sleep in the staff room on the night of $D$. Counting them on their departure date creates false overbooked alerts and distorts bed planning.

**Independent Test**:
- Consider a volunteer whose stay is from Monday `2026-11-02` to Saturday `2026-11-07`.
- Inspect the daily confirmed counts on `/admin/timeline`:
  - From Monday `2026-11-02` through Friday `2026-11-06`, the volunteer is included in the nightly total (+1 bed).
  - On Saturday `2026-11-07` (their checkout day), the volunteer is **NOT** included in the total (0 beds for Saturday night).

**Acceptance Scenarios**:
1. **Given** a volunteer departing on date $D$, **When** calculating daily confirmed volunteer counts for date $D$, **Then** the volunteer is excluded from date $D$'s total count.
2. **Given** a volunteer with an open-ended stay (`noEndDate: true`), **When** calculating counts, **Then** they are counted for each night on and after their arrival date until an explicit departure date is established.
3. **Given** the `/api/admin/timeline` endpoint, **When** queried, **Then** `dailyConfirmedCounts[date]` represents nightly bed demand ($departureDate > date$).

---

## Edge Cases

- **Single-Day Stays (Arrival = Departure)**: If a volunteer arrives and departs on the same date, they do not stay overnight; cell renders hatched departure styling and adds 0 to overnight bed demand.
- **Volunteers with "No end date"**: All days on or after arrival render in solid intense color with no hatched departure day, and count towards nightly bed demand.
- **Unconfirmed (Applied) Candidates**: Do not count towards confirmed bed demand on any day.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Timeline chart day cells MUST NOT render literal `'1'` or `'0'` text characters.
- **FR-002**: For any volunteer with a defined departure date, the cell corresponding to their departure date (`date === departureDate`) MUST render with a visually distinct lighter shade or hatched pattern.
- **FR-003**: The cells for all active stay days prior to the departure date MUST render with intense solid bar shading.
- **FR-004**: In both the `/api/admin/timeline` backend and frontend display, a volunteer MUST be included in `dailyConfirmedCounts[date]` if and only if:
  1. `status === 'Active' || status === 'Accepted'`, AND
  2. `arrivalDate <= date`, AND
  3. `(noEndDate === true || !departureDate || departureDate > date)`.
- **FR-005**: A volunteer MUST NOT be included in `dailyConfirmedCounts[date]` on their departure date (`date === departureDate`).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 0 cells on the timeline grid contain numeric '1' or '0' text.
- **SC-002**: 100% of volunteers with a departure date display distinct lighter/hatched departure styling on their final day.
- **SC-003**: Daily confirmed volunteer count matches exact overnight bed demand across all calendar days (0 departure-day bed count over-allocations).
