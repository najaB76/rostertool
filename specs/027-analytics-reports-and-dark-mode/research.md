# Research & Technical Decisions: Volunteer Analytics & Reporting, Timeline Datepicker, and Accessible Dark Mode

**Feature**: `027-analytics-reports-and-dark-mode`
**Date**: 2026-10-27
**Status**: Completed

## 1. Analytics & Reporting Data Engine

- **Decision**:
  - Implement `ReportingService` and endpoint `GET /api/admin/reports` in `src/server/routes/admin-reports.ts`.
  - Fetch all `volunteers` and `volunteer_stays` from SQLite, and compute in-memory analytics:
    1. Overall summary KPIs: Total volunteers, total completed stays, weighted average star rating, and rehire recommendation percentage.
    2. Demographics by country: Volunteer counts, percentage share, average star rating (where stays > 0), and rehire ratio.
    3. Performance by age bracket: Categorize volunteer age at stay into standard brackets (`<22`, `22-25`, `26-30`, `31-40`, `41+`).
    4. Gender distribution and ratings: Male, Female, Neutral, Unspecified.
    5. Continent aggregation: Map ISO country codes (including regional sub-codes like `GB-SCT`, `GB-ENG`) to continents (Europe, North America, South America, Asia, Oceania, Africa).
    6. Rehire recommendations by country: Crosstabulate Accept vs Possible vs Do Not Accept with percentages.

## 2. Interactive Charts & Data Tables

- **Decision**:
  - Build lightweight, platform-native responsive SVG charts (horizontal distribution bars, comparative column bars, and metric cards) directly in `AdminReportsPage.tsx`.
  - Avoid heavy external charting dependencies to maintain self-hosted zero-config performance and fast bundle times.
  - Provide table/chart views for every crosstabulation.

## 3. Timeline Datepicker Jump Navigation

- **Decision**:
  - Add an `<input type="date">` control in `AdminTimelinePage.tsx` navigation bar.
  - When the user selects any date, snap it to Monday with `snapToMonday` and set `startDate`.
  - Instantly reloads the 5-week timeline view centered on the chosen date.

## 4. Theme System & Flag Contrast Protection

- **Decision**:
  - Implement `ThemeContext.tsx` providing `theme: 'light' | 'dark'` and `toggleTheme()`, persisted in `localStorage`.
  - In `CountryFlag.tsx`, apply a soft 1px border (`boxShadow: 0 0 0 1px rgba(255,255,255,0.25)`) when dark mode is active to ensure dark flags (e.g. Germany, Belgium, Angola) remain distinct and legible per Constitution Principle II.
