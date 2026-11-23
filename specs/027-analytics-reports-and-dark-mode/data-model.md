# Data Model: Volunteer Analytics & Reporting, Timeline Datepicker, and Accessible Dark Mode

**Feature**: `027-analytics-reports-and-dark-mode`
**Date**: 2026-10-27
**Status**: Completed

## Analytics Response Schema (`GET /api/admin/reports`)

```typescript
export interface ReportsData {
  kpis: {
    totalVolunteers: number;
    totalStays: number;
    averageRating: number;
    rehireAcceptPercent: number;
  };
  byCountry: Array<{
    country: string;
    volunteerCount: number;
    sharePercent: number;
    averageRating: number | null;
    ratingCount: number;
    rehireAcceptRate: number | null;
  }>;
  byContinent: Array<{
    continent: string;
    volunteerCount: number;
    sharePercent: number;
    averageRating: number | null;
    ratingCount: number;
  }>;
  byAgeBracket: Array<{
    bracket: '<22' | '22-25' | '26-30' | '31-40' | '41+' | 'Unknown';
    volunteerCount: number;
    averageRating: number | null;
    ratingCount: number;
  }>;
  byGender: Array<{
    gender: 'Male' | 'Female' | 'Neutral' | 'Unspecified';
    volunteerCount: number;
    averageRating: number | null;
    ratingCount: number;
  }>;
  rehireRatiosByCountry: Array<{
    country: string;
    totalReviews: number;
    acceptCount: number;
    possibleCount: number;
    doNotAcceptCount: number;
    acceptPercent: number;
    possiblePercent: number;
    doNotAcceptPercent: number;
  }>;
}
```

## Theme Schema

```typescript
export type ThemeMode = 'light' | 'dark';

export interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
}
```
