# Research & Technical Decisions: Timeline Applied Candidates Population & Resizable Modal Fix

**Feature**: `019-timeline-applied-and-modal-resize`
**Date**: 2026-10-27
**Status**: Completed

## 1. Candidate Section Population on Timeline

- **Decision**:
  - In `src/server/routes/admin-timeline.ts`, categorize volunteers into sections based on their operational stage:
    - **Active Staff (On-Site)**: Volunteers with `status === 'Active'` (and historical on-site stays) are placed into `receptionEntries` or `housekeepingEntries`.
    - **Incoming Candidates (Pipeline)**: Volunteers with `status === 'Accepted'` and `status === 'Applied'` are placed into `appliedEntries`.
    - Both `Applied` and `Accepted` incoming candidates are displayed in Section 4 for the dates they have applied or been accepted for.
    - `dailyAppliedCounts` calculates the daily sum of candidates in Section 4 across each calendar day.
    - `dailyConfirmedCounts` retains confirmed overnight bed demand (`Active` + `Accepted`).
- **Rationale**:
  - Solves the defect where Section 4 was permanently empty ("No applied candidates in this date window") and running total was 0 because accepted candidates were removed from the candidate section.
  - Matches coordinator expectations: operational sections show who is currently working, while Section 4 shows incoming arrivals and applicants for the dates they have been accepted for.

## 2. Interactive Drag-to-Resize for Volunteer Modal

- **Decision**:
  - Implement a dedicated mouse-drag resize handler in `VolunteerModal.tsx`:
    - Manage `dimensions` state (`width: number`, `height: number`).
    - Render a visible diagonal corner grip (`⋰`) with `cursor: 'nwse-resize'` at the bottom-right corner of the modal container.
    - Mouse drag calculates displacement relative to the modal's origin, clamped within `minWidth: 480px`, `minHeight: 400px`, `maxWidth: 95vw`, and `maxHeight: 95vh`.
- **Rationale**:
  - Standard CSS `resize: both` is often suppressed by parent flexbox centering and modal overflow rules in WebKit/Blink browsers.
  - An interactive mouse-drag handle guarantees smooth, cross-browser, cross-platform resizing.
