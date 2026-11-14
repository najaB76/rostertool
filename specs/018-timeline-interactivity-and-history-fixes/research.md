# Research & Technical Decisions: Timeline Interactivity, Historical Staffing, and Volunteer Edit Enhancements

**Feature**: `018-timeline-interactivity-and-history-fixes`
**Date**: 2026-10-27
**Status**: Completed

## 1. Historical Timeline Staffing & Point-in-Time Status

- **Decision**:
  - In `src/server/routes/admin-timeline.ts`, query all volunteers who have an active or historical stay overlapping the timeline window $[T_{start}, T_{end}]$ (including `Departed` volunteers).
  - Check both `volunteers` current stay fields (`arrivalDate`, `departureDate`, `noEndDate`) and records in `volunteer_stays`.
  - For volunteers whose stay overlaps the requested window, determine their point-in-time status:
    - If the timeline window is in the past and falls within their recorded stay dates, render them as active on site (`Active`) in Reception or Housekeeping, rather than excluding them because their *current* status months later is `Departed`.
  - Include these volunteers in `dailyConfirmedCounts` for the nights they were on site during that historical window.

## 2. Interactive Direct Actions on Timeline

- **Decision**:
  - Make volunteer names in Column B clickable links/buttons that open `VolunteerModal`.
  - Make status pills interactive buttons with an action dropdown:
    - `Active`: "Depart" (opens `DepartureModal`), "Revert to Confirmed"
    - `Accepted`: "Mark Arrived (In da house)", "Cancel"
    - `Departed`: "Re-activate" (opens `ReactivateModal`)
    - `Applied`: "Accept Application" (opens dialog / modal)
  - When any modal or action completes, trigger `fetchTimeline()` to refresh data without page reload.

## 3. Running Total Row for Applied Volunteers

- **Decision**:
  - Add a "Total APPLIED Candidates" row at the bottom of the Unconfirmed section in `AdminTimelinePage.tsx`.
  - Sum the daily counts of applied candidates whose dates overlap each day column.

## 4. Fix Volunteer Source Synchronization

- **Decision**:
  - In `src/server/services/volunteer-service.ts`:
    Ensure `source` field in `volunteers` table is explicitly saved with `data.applicationSourceName || data.source`.
  - In `src/server/routes/admin-timeline.ts` and `AdminVolunteersPage.tsx`:
    Resolve source name cleanly (`v.source || v.applicationSourceName || 'Other'`).

## 5. Resizable & Esc-Dismissible VolunteerModal

- **Decision**:
  - In `src/client/components/VolunteerModal.tsx`:
    - Add `resize: 'both'` with `minWidth: '480px'`, `minHeight: '400px'`, `maxWidth: '90vw'`, `maxHeight: '90vh'`.
    - Add `useEffect` listener for `Escape` key to call `onClose()`.
