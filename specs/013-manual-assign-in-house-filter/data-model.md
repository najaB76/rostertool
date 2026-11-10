# Data Model: In-House Volunteer Candidate Filtering

**Feature**: `013-manual-assign-in-house-filter`
**Date**: 2026-10-27
**Status**: Completed

## Invariants & Selection Rules

### In-House Roster Week Overlap Rule
Given a roster week starting on Monday $W_{start}$ and ending on Sunday $W_{end}$:
A volunteer $V$ is eligible to be listed as a candidate if and only if:
1. $V.status \in \{\text{'Active'}, \text{'Accepted'}\}$
2. $V.arrivalDate \le W_{end}$
3. $V.noEndDate = \text{true} \lor V.departureDate \ge W_{start}$
