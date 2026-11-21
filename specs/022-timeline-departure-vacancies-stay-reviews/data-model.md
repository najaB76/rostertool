# Data Model: Timeline Departure Date Integrity, Daily Vacancies Row, and Editable Stay Reviews

**Feature**: `022-timeline-departure-vacancies-stay-reviews`
**Date**: 2026-10-27
**Status**: Completed

## Stay Consolidation Precedence Invariant

For volunteer $V$ with current stay $(V.arrivalDate, V.departureDate, V.noEndDate)$:
1. If any historical stay $S \in volunteer\_stays$ has $S.arrivalDate = V.arrivalDate$:
   - The current record $V$ is authoritative. $S$ MUST NOT be added as an independent stay with conflicting dates.
2. If $V.departureDate$ is updated, the active stay in $volunteer\_stays$ is updated with the same $departureDate$.

## Stay Review Update Schema (`PUT /api/admin/volunteers/:id/stays/:stayId`)

```typescript
export interface UpdateStayReviewRequest {
  departureRating?: number; // 1 to 5
  departureNotes?: string;
  rehireStatus?: 'Accept' | 'Conditional' | 'Do Not Accept';
}
```

## Daily Vacancies Invariant

For any date $D$:
$$\text{Vacancies}[D] = \max(0, \text{Baseline} - \text{DailyConfirmedCount}[D])$$
