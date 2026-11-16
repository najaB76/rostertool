# Research & Technical Decisions: Timeline Hierarchy, Roster Assignment Accuracy, and Visual Enhancements

**Feature**: `021-timeline-roster-ux-improvements`
**Date**: 2026-10-27
**Status**: Completed

## 1. Timeline Hierarchy & Candidate Pool Separation

- **Decision**:
  - In `src/server/routes/admin-timeline.ts`, volunteers who have moved past the `'Applied'` state (`status === 'Active'` and `status === 'Accepted'`, plus historical on-site stays) are placed in operational departments (`receptionEntries` or `housekeepingEntries`).
  - Section 4 (`appliedEntries`) is restricted strictly to volunteers in the `'Applied'` state (unconfirmed pipeline).
  - The "Total CONFIRMED Volunteers" row sums all confirmed volunteers (`Active` and `Accepted`) for overnight bed demand.
  - The "Total APPLIED Candidates" row sums candidates in `'Applied'` state for each day.
  - Historical point-in-time staffing remains fully preserved when scrolling backwards.

## 2. Shift-Day In-House Candidate Filtering in `ShiftAssignModal`

- **Decision**:
  - Filter candidates in `ShiftAssignModal.tsx` strictly against the shift date $D$ (`shift.date`):
    - Must have arrived on or before $D$ (`arrivalDate <= D`).
    - Must not have departed prior to $D$ (`noEndDate || !departureDate || departureDate >= D`).
    - Must have status `Active` (in house) or `Accepted` (accepted incoming who will be in house on date $D$).
    - Excludes anyone who departed prior to $D$ or arrives after $D$.
- **Rationale**:
  - Exactly aligns candidate selection with operational shift reality for that specific day.

## 3. Sticky Name Column on Timeline

- **Decision**:
  - Apply CSS `position: 'sticky'` with `left: 0` for Sex column (Col A) and `left: '32px'` for Name column (Col B).
  - Use `backgroundColor: '#fff'` (or `#f1f5f9` for headers) and `zIndex: 10` (20 for headers) to prevent scrolling day cells from clipping under transparent backgrounds.

## 4. Date Header Column Highlighting

- **Decision**:
  - In `AdminTimelinePage.tsx`, maintain `highlightedDate: string | null` state.
  - Clicking any date header cell toggles `highlightedDate`.
  - When active, cells in that column render with a soft blue/gold column highlight (`#eff6ff` or distinct column border) for effortless vertical inspection.

## 5. Training Status Cell Highlighting on Printable Roster

- **Decision**:
  - In `PrintableRosterView.tsx`, when an assigned volunteer has `inTraining === true`, style the cell with `backgroundColor: '#fef9c3'` (light yellow) and `#ca8a04` accent.
