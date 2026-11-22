# Research & Technical Decisions: Volunteer JSON Import CLI Tool

**Feature**: `024-import-residents-cli`
**Date**: 2026-10-27
**Status**: Completed

## 1. CLI Import Tool Design

- **Decision**:
  - Implement `scripts/import-residents.ts` runnable via `npx tsx scripts/import-residents.ts [filePath] [--dry-run]`.
  - Add an npm script: `"import:residents": "tsx scripts/import-residents.ts"`.
  - Parse `residents.json`, validate schema, and use Drizzle ORM batch/transaction operations.

## 2. Field Mapping & Transformation Rules

- **Full Name**: `${r.given_names} ${r.family_name}`.trim().
- **Preferred Name**: `r.preferred_name || null`.
- **Gender**: `r.gender === 'M' ? 'Male' : r.gender === 'F' ? 'Female' : 'Unspecified'`.
- **Status Determination**:
  - `!r.arrival_date`: `'Cancelled'` (notes confirm "Never arrived").
  - `r.arrival_date > today`: `'Accepted'`.
  - `!r.departure_date || r.departure_date >= today`: `'Active'`.
  - `r.departure_date < today`: `'Departed'`.
- **Future Acceptance**:
  - `'Yes'` $\rightarrow$ `'YES'`.
  - `'No'` $\rightarrow$ `'NO'`.
  - `'Up to you'` $\rightarrow$ `'CONDITIONAL'`.
- **Stay Records**:
  - Create `volunteer_stays` for each volunteer who has `arrival_date`.
  - Store `departureRating: r.star_rating > 0 ? r.star_rating : null`.
  - Store `departureNotes: r.notes`.
  - Store `rehireStatus`: `'Yes'` $\rightarrow$ `'Accept'`, `'No'` $\rightarrow$ `'Don\'t Accept'`, `'Up to you'` $\rightarrow$ `'Possible'`.

## 3. Flag Normalization for Sub-Regions

- **Decision**:
  - In `CountryFlag.tsx`, normalize `countryCode`: `code.toUpperCase().replace('-', '_')`.
  - Allows `GB-SCT` $\rightarrow$ `GB_SCT` (Scotland flag) and `GB-ENG` $\rightarrow$ `GB_ENG` (England flag) in `country-flag-icons`.
