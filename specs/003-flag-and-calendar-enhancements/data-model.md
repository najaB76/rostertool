# Data Model: Flag, Roster & Headcount Enhancements

**Feature**: `003-flag-and-calendar-enhancements`
**Date**: 2026-10-27
**Status**: Completed

## 1. Entities & UI Models

### 1.1 `CountryFlag` Component Model
- Input: `countryCode: string` (ISO 3166-1 alpha-2, e.g. `'FR'`, `'BR'`, `'US'`, `'DE'`).
- Graphical Output: Standalone SVG icon vector with standardized aspect ratio (e.g. 3:2 or 4:3), rounded corners (2px), and CSS sizing `height: 1em; width: auto; vertical-align: -0.15em; display: inline-block`.
- Fallback: Crisp SVG globe icon when the country code is unknown or missing.

### 1.2 `ShiftSlotCell` Volunteer Presentation Model
- Input: `volunteer: { id: string; fullName: string; nationality: string; primaryRole: string }`.
- Display:
  - Display Text: `getFirstName(volunteer.fullName)` (e.g. "Elena", "Jean-Luc", "Marcelo").
  - Graphic Flag: `<CountryFlag countryCode={volunteer.nationality} />`.
  - Tooltip: Full name, nationality, and primary role.

### 1.3 `VolunteerCard` Magic Link Model
- Attributes:
  - `magicLinkToken`: secure random token from database.
  - `portalUrl`: `${window.location.origin}/portal?token=${volunteer.magicLinkToken}`.
  - Actions:
    - `copy`: copies `portalUrl` to system clipboard.
    - `regenerate`: invokes `POST /api/admin/volunteers/:id/reset-token` and updates `volunteer.magicLinkToken`.

### 1.4 `HeadcountCalendar` Grid Model
- Weekday columns:
  - `0`: Monday (`Mon`)
  - `1`: Tuesday (`Tue`)
  - `2`: Wednesday (`Wed`)
  - `3`: Thursday (`Thu`)
  - `4`: Friday (`Fri`)
  - `5`: Saturday (`Sat`)
  - `6`: Sunday (`Sun`)
- Cell Structure:
  - `Leading Padding`: $N$ blank placeholders where $N = (\text{DayOfWeek}(Day_1) + 6) \pmod 7$.
  - `Days`: 1..LastDay of month.
