# Research & Technical Decisions: Dynamic Headcount Settings Integration

**Feature**: `014-headcount-settings-sync`
**Date**: 2026-10-27
**Status**: Completed

## 1. Dynamic Headcount Status Evaluation

- **Decision**: In `HeadcountService.getDailyHeadcounts`, read `systemSettings` from SQLite and dynamically evaluate day status:
  - `headcount_baseline`: default 11
  - `headcount_low_min`: default 8
  - `headcount_low_max`: default 10
  - `headcount_critical`: default 8
  - `headcount_overbooked`: default 11
- **Status Mapping**:
  - `count < critical` $\to$ `CRITICAL_LOW`
  - `count >= lowMin && count <= lowMax` $\to$ `LOW_WARNING`
  - `count === baseline` $\to$ `OPTIMAL`
  - `count > overbooked` $\to$ `CRITICAL_HIGH`
  - Between lowMax and baseline: `OPTIMAL`
- **Frontend Legend**:
  - `AdminHeadcountPage` fetches `/api/admin/settings` and displays the live benchmarks in the legend banner instead of hardcoded numbers.
