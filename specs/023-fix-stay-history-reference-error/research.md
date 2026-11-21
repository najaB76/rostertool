# Research & Technical Decisions: Fix Stay History Modal ReferenceError

**Feature**: `023-fix-stay-history-reference-error`
**Date**: 2026-10-27
**Status**: Completed

## 1. Root Cause & Solution

- **Root Cause**:
  - In `src/client/pages/AdminVolunteersPage.tsx`, line 631, `onStayUpdated={loadVolunteers}` was passed to `StayHistoryModal`.
  - The volunteer fetch handler defined in `AdminVolunteersPage.tsx` is named `fetchVolunteers`.
  - Referencing the non-existent identifier `loadVolunteers` causes an immediate `Uncaught ReferenceError: loadVolunteers is not defined` as soon as `stayHistoryVol` is truthy, resulting in a blank page crash.
- **Decision**:
  - Correct the prop passed to `StayHistoryModal`: `onStayUpdated={fetchVolunteers}`.
