# Data Model: Complete Dark Mode CSS Audit, Report Date Slicing, and Sortable Tables

**Feature**: `028-dark-mode-css-and-reports-filtering`
**Date**: 2026-10-27
**Status**: Completed

## Date Filtered Reports Query Contract

- **Endpoint**: `GET /api/admin/reports`
- **Query Parameters**:
  - `startDate`: string (optional, YYYY-MM-DD)
  - `endDate`: string (optional, YYYY-MM-DD)

## Report Sorting Model

```typescript
export interface SortConfig<T> {
  key: keyof T;
  direction: 'asc' | 'desc';
}
```

## Dark Theme Palette

| Token | Light Mode | Dark Mode | Usage |
|---|---|---|---|
| `--bg-body` | `#f4f4f5` | `#0b0f19` | Application canvas |
| `--bg-card` | `#ffffff` | `#1e293b` | Volunteer cards, KPI widgets, schedule cells |
| `--bg-muted` | `#f8fafc` | `#0f172a` | Table headers, sticky columns |
| `--text-main` | `#0f172a` | `#f8fafc` | Primary typography |
| `--text-muted` | `#64748b` | `#94a3b8` | Subtitles, labels |
| `--border-subtle` | `#e2e8f0` | `#334155` | Dividers, card borders, table borders |
