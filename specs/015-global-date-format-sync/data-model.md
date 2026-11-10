# Data Model: Global Date Format Synchronization

**Feature**: `015-global-date-format-sync`
**Date**: 2026-10-27
**Status**: Completed

## Date Formatting Contract
```typescript
export type DateFormatPreference = 'YYYY-MM-DD' | 'DD-MM-YYYY';

export interface DateFormatContextType {
  dateFormatPreference: DateFormatPreference;
  setDateFormatPreference: (pref: DateFormatPreference) => void;
  formatDate: (input: string | Date | null | undefined, includeDay?: boolean) => string;
}
```

### Invariant
Database and API payload formats strictly maintain `YYYY-MM-DD`. Only user-facing display text adapts to `DateFormatPreference`.
