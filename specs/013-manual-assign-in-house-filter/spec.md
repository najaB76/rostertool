# Feature Specification: In-House Volunteer Candidate Filtering for Manual Shift Assignment

**Feature Branch**: `013-manual-assign-in-house-filter`

**Created**: 2026-10-27

**Status**: Draft

**Input**: User report: "FIX: For manual shift assignment ONLY include volunteers who will be in-house during the roster week. With the current implementation are including all volunteers (including those who departed more than a week ago), this will quickly get unmanagable as there can be over 100 volunteers a year."

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Filter Manual Shift Assignment Candidates to In-House Volunteers (Priority: P1)

As a hostel manager assigning volunteers to shifts manually on the Weekly Roster, I want the candidate selector modal (`ShiftAssignModal`) to only list volunteers who will actually be in-house (on site) during the selected roster week, so that I am not overwhelmed by dozens of departed or future volunteers.

**Why this priority**: Hostels host 100+ volunteers each year. Displaying volunteers who departed in prior weeks or who arrive in future weeks clutters the candidate picker, slows down scheduling, and causes assignment confusion.

**Independent Test**:
- Ensure the database contains:
  1. Volunteer A: in-house during the current roster week (arrival date $\le$ week end, departure date $\ge$ week start).
  2. Volunteer B: departed last week (departure date $<$ week start).
  3. Volunteer C: arrives two weeks in the future (arrival date $>$ week end).
  4. Volunteer D: departed volunteer with status `'Departed'`.
- Open `/admin/roster` for the current week and click an unassigned shift slot.
- Inspect the "Active Volunteers" candidate list in the assignment modal.
- Verify that **only** Volunteer A is displayed.
- Verify that Volunteer B (departed past week), Volunteer C (future arrival), and Volunteer D (status Departed) are completely excluded from the list.

**Acceptance Scenarios**:
1. **Given** a shift slot on the weekly roster for week $W$ (Monday $W_{start}$ to Sunday $W_{end}$), **When** opening the candidate assignment modal, **Then** only volunteers whose stay dates overlap with week $W$ (`arrivalDate <= W_end` AND (`noEndDate` OR `departureDate >= W_start`)) and whose status is active/accepted are displayed.
2. **Given** a volunteer who departed prior to week $W$ (`departureDate < W_start`), **When** viewing candidates for week $W$, **Then** that volunteer is not listed.
3. **Given** a volunteer whose arrival date is after week $W$ (`arrivalDate > W_end`), **When** viewing candidates for week $W$, **Then** that volunteer is not listed.
4. **Given** a volunteer who arrives or departs mid-week during week $W$, **When** viewing candidates, **Then** they appear in the list for that week, with individual days outside their specific stay dates disabled as "Outside Stay".

---

## Edge Cases

- **Volunteers with "No end date"**: Counted as in-house for all weeks after their arrival date (`arrivalDate <= W_end`).
- **Volunteers without recorded arrival date**: Excluded from active candidate lists until their arrival date is scheduled/accepted.
- **Mid-week turnover (e.g. departs Wednesday)**: The volunteer is listed in the candidate modal for that week because they are on site Monday through Wednesday, but shifts on Thursday–Sunday display "Outside Stay" and cannot be clicked.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The manual shift assignment modal (`ShiftAssignModal`) MUST restrict the candidate volunteer list to volunteers who are in-house during the roster week containing the shift.
- **FR-002**: A volunteer MUST be considered in-house during roster week $W$ ($W_{start}$ to $W_{end}$) if and only if:
  1. Their status is `Active` or `Accepted` (not `Departed` or `Cancelled`), AND
  2. Their `arrivalDate` is on or before $W_{end}$, AND
  3. Either `noEndDate` is true OR their `departureDate` is on or after $W_{start}$.
- **FR-003**: Volunteers who departed before $W_{start}$ MUST NOT appear in the candidate list for week $W$.
- **FR-004**: Volunteers arriving after $W_{end}$ MUST NOT appear in the candidate list for week $W$.
- **FR-005**: The `/api/admin/volunteers` endpoint (or the candidate loading mechanism in `ShiftAssignModal`) MUST support filtering by date range / active week to prevent fetching hundreds of historical volunteers over time.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 0 volunteers who departed prior to the roster week appear in the manual shift assignment candidate list.
- **SC-002**: 0 volunteers who arrive after the roster week appear in the manual shift assignment candidate list.
- **SC-003**: 100% of volunteers displayed in the assignment modal have a stay overlapping the roster week.
- **SC-004**: Candidate list rendering remains instantaneous (< 100ms) regardless of the total count of historical volunteers in the database.
