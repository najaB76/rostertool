# Data Model: Timeline Shading & Bed Count Capacity Adjustments

**Feature**: `016-timeline-shading-and-bed-counts`
**Date**: 2026-10-27
**Status**: Completed

## Overnight Bed Demand Invariant
For any date $D$ on the timeline calendar:
A volunteer $V$ is counted towards `dailyConfirmedCounts[D]` if and only if:
1. $V.status \in \{\text{'Active'}, \text{'Accepted'}\}$
2. $V.arrivalDate \le D$
3. $V.noEndDate = \text{true} \lor V.departureDate > D$

### Visual Invariant
1. On day $D$ where $D < V.departureDate$, cell is shaded in solid `barColor`.
2. On day $D$ where $D = V.departureDate$, cell is styled with a distinct lighter / hatched pattern and label "Departing".
3. Cell text is empty (no literal '1' or '0').
