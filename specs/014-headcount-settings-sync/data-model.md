# Data Model: Dynamic Headcount Settings Integration

**Feature**: `014-headcount-settings-sync`
**Date**: 2026-10-27
**Status**: Completed

## Headcount Status Rules
Given stored settings:
- `baseline = headcount_baseline` (11)
- `lowMin = headcount_low_min` (8)
- `lowMax = headcount_low_max` (10)
- `critical = headcount_critical` (8)
- `overbooked = headcount_overbooked` (11)

For any day with on-site volunteer count $C$:
- If $C < \text{critical}$: status is `'CRITICAL_LOW'`
- Else if $C \ge \text{lowMin} \land C \le \text{lowMax}$: status is `'LOW_WARNING'`
- Else if $C > \text{overbooked}$: status is `'CRITICAL_HIGH'`
- Else: status is `'OPTIMAL'`
