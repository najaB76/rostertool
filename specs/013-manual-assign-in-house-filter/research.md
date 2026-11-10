# Research & Technical Decisions: In-House Volunteer Candidate Filtering

**Feature**: `013-manual-assign-in-house-filter`
**Date**: 2026-10-27
**Status**: Completed

## 1. Candidate Filtering Logic for Manual Assignment

- **Decision**: Filter candidate volunteers in `ShiftAssignModal` (and optionally in `/api/admin/volunteers`) based on stay overlap with the roster week ($W_{start}$ to $W_{end}$).
- **Rationale**:
  - The modal receives `shift.date`. Using `snapToMonday(shift.date)` and `addDays(monday, 6)` calculates the exact roster week boundaries ($W_{start}$ and $W_{end}$).
  - A volunteer is in-house during the week if:
    1. `status !== 'Departed' && status !== 'Cancelled'`
    2. `arrivalDate <= W_end`
    3. `noEndDate || departureDate >= W_start`
  - Volunteers who left in prior weeks (`departureDate < W_start`) or arrive in future weeks (`arrivalDate > W_end`) are excluded.
- **Alternatives Considered**:
  - *Filtering solely on shift.date*: Overly restrictive; mid-week arrivals who arrive on Wednesday should be visible as candidates for the week so the manager knows they are in-house, with Mon-Tue disabled as "Outside Stay".
