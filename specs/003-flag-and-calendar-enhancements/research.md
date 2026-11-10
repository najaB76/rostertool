# Research & Technical Decisions: Flag, Roster & Headcount Enhancements

**Feature**: `003-flag-and-calendar-enhancements`
**Date**: 2026-10-27
**Status**: Completed

## 1. Graphic SVG Flag Rendering Across Browsers

- **Decision**: Adopt `country-flag-icons` (or dedicated SVG flag assets) bundled as vector components.
- **Rationale**:
  - Operating system emoji fonts (especially on Windows 10/11 and desktop Linux distributions like Debian/Ubuntu without Noto Color Emoji) do not render regional indicator pairs as graphic flags. Instead, they display literal letter boxes ("US", "FR", "DE").
  - Rendering flags as inline SVG images guarantees 100% crisp vector graphic display across all host operating systems, desktop browsers, and mobile devices without depending on OS-level font glyphs.
  - The assets are bundled locally into `dist/` by Vite, preserving offline self-hosted operation on local Proxmox LANs without external CDN dependencies.
- **Alternatives Considered**:
  - *External image CDN (e.g. flagcdn)*: Rejected; violates Constitution Principle III (self-hosted offline reliability).
  - *Installing TTF emoji fonts on client OS*: Impractical; management and volunteer users access the hostel tool from diverse personal laptops and phones.

---

## 2. First-Name Extraction & Disambiguation

- **Decision**: In `ShiftSlotCell.tsx`, display the volunteer's first name:
  ```typescript
  export function getFirstName(fullName: string): string {
    if (!fullName) return '';
    return fullName.trim().split(/\s+/)[0];
  }
  ```
  The full name remains accessible in the cell's `title` attribute as a hover tooltip.
- **Rationale**:
  - Matches the physical hostel roster convention demonstrated in `WhatsApp Image 2026-10-25 at 16.01.45.jpeg` where shifts list "Hervé", "Chris", "Alda", "Marcelo", "Brenda", etc.
  - Reduces cell text length by ~50%, preventing text clipping and awkward word wrapping on 7-column desktop screens.
- **Alternatives Considered**:
  - *Truncating names with CSS ellipsis*: Cuts off names mid-word and looks unpolished.

---

## 3. Magic Link Management UI on Volunteer Cards

- **Decision**:
  - Display the full volunteer portal URL: `${window.location.origin}/portal?token=${v.magicLinkToken}`.
  - Provide a **Copy Link** button using the browser Clipboard API (`navigator.clipboard.writeText`) with a visual `Copied!` tooltip/badge.
  - Provide a **Regenerate Link** button calling the existing backend endpoint `POST /api/admin/volunteers/:id/reset-token`, which generates a new cryptographic token and invalidates the previous token.
- **Rationale**:
  - The backend reset endpoint was implemented in Phase 5, but lacked a prominent UI control on the volunteer card.
  - Managers can quickly copy links to paste into WhatsApp, Signal, or email when coordinating with arriving volunteers.
- **Alternatives Considered**:
  - *Displaying token only*: Inconvenient for managers who need the complete, clickable URL.

---

## 4. Monday-Aligned Calendar Grid Mathematics

- **Decision**:
  - Display explicit weekday column headers: `Mon`, `Tue`, `Wed`, `Thu`, `Fri`, `Sat`, `Sun`.
  - Calculate leading offset padding cells using Monday-first modular arithmetic:
    ```typescript
    // JavaScript getDay(): 0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat
    // Monday-first index: Mon = 0, Tue = 1, Wed = 2, Thu = 3, Fri = 4, Sat = 5, Sun = 6
    export function getMondayFirstDayOfWeek(dateStr: string): number {
      const d = new Date(dateStr);
      return (d.getDay() + 6) % 7;
    }
    ```
  - For any given month, prepend `getMondayFirstDayOfWeek(firstDateOfMonth)` empty padding cells.
  - Apply the same padding calculation to both Detailed Month view and Compact Heatmap mode.
- **Rationale**:
  - RosterTool operates on a strict Monday-to-Sunday weekly cycle.
  - Previously, October 1 (Thursday) was placed in Column 1, shifting Tuesday October 27 to Column 7.
  - With 3 offset cells (Mon, Tue, Wed empty), October 1 sits in Column 4 (Thu) and October 27 sits accurately in Column 2 (Tue).
