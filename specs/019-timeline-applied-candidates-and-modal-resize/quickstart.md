# Quickstart: Timeline Applied Candidates Population & Resizable Modal Fix

**Feature**: `019-timeline-applied-and-modal-resize`

## Verification Scenarios

### Scenario 1: Candidate Section Displays Accepted and Applied Volunteers
1. Accept a volunteer for upcoming dates (e.g. Nov 20 to Dec 10).
2. Open `/admin/timeline`.
3. In Section 4 (Candidate section), verify the volunteer is displayed with their stay bar for the dates they have been accepted for.
4. Verify the "Total APPLIED Candidates" running total row accurately sums to $\ge 1$ for those days.

### Scenario 2: Resizing VolunteerModal
1. Click any volunteer's name on `/admin/timeline` or `/admin/volunteers`.
2. Grab the bottom-right corner resize handle (`⋰`).
3. Drag diagonally outward and inward.
4. Verify the modal expands and shrinks smoothly.
5. Press `Esc` $\to$ modal closes immediately.
