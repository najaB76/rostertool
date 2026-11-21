# Data Model: Fix Stay History Modal ReferenceError

**Feature**: `023-fix-stay-history-reference-error`
**Date**: 2026-10-27
**Status**: Completed

## Component Props Mapping

In `AdminVolunteersPage.tsx`:
```typescript
interface StayHistoryModalProps {
  isOpen: boolean;
  volunteer: any;
  onClose: () => void;
  onStayUpdated?: () => void; // Wired to fetchVolunteers
}
```
