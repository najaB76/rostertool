# Implementation Plan: Flag, Roster & Headcount Enhancements

**Branch**: `003-flag-and-calendar-enhancements` | **Date**: 2026-10-27 | **Spec**: [specs/003-flag-and-calendar-enhancements/spec.md](spec.md)

**Input**: Feature specification from `specs/003-flag-and-calendar-enhancements/spec.md`

## Summary

Implement four visual and usability improvements across the client interface:
1. Universal graphic SVG flags via `country-flag-icons` (replacing emoji font dependencies).
2. Display first names only on the weekly shift grid cards with full-name hover tooltips.
3. Manage magic links on volunteer cards (portal link display, 1-click copy, and token regeneration).
4. Monday-aligned Headcount Calendar grid layout with weekday headers (`Mon`–`Sun`) and empty offset cells.

## Technical Context

**Language/Version**: Node.js (v22 LTS) & TypeScript 5.8+

**Primary Dependencies**: Fastify 5.x, React 19, Vite 8, `country-flag-icons` (lightweight SVG vector flags)

**Storage**: SQLite (`data/rostertool.sqlite`) with WAL mode

**Testing**: Vitest (`npm test`)

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle / Gate | Requirement | Architecture Compliance | Status |
|---|---|---|---|
| **I. Test-First Engine & Invariants** | Constraint solver remains pure and tested. | No changes to constraint solver engine. | **PASS** |
| **II. Cultural Identity & High-Visibility Flags** | Flags must prominently display adjacent to volunteer names in all views. | Replaces system font emojis with crisp SVG vector flags so flags ALWAYS render graphically on all operating systems (Windows/Linux/etc.). | **PASS** |
| **III. Self-Hosted Simplicity & Zero-Config** | Embedded SQLite, native Proxmox LXC, zero external CDN dependencies. | SVG flag assets are bundled locally into `dist/` by Vite; 100% offline-capable. | **PASS** |
| **IV. Human Override & Visual Highlighting** | Manager maintains direct control over shifts and magic links. | Added 1-click magic link regeneration and copying directly on volunteer cards. | **PASS** |
| **V. Low-Friction Magic-Link Access** | Magic links remain accessible without passwords. | Full URL displayed with copy/reset capabilities. | **PASS** |

---

## Project Structure & File Modifications

### Client UI (`src/client/`)
- `package.json`: Add `country-flag-icons` dependency.
- `src/client/components/CountryFlag.tsx`: Refactor to render graphical SVG flags via `country-flag-icons` with SVG globe fallback.
- `src/client/components/CountrySelect.tsx`: Use `CountryFlag` SVG component inside country option dropdown.
- `src/client/components/ShiftSlotCell.tsx`: Extract and render first name only, preserving full name in tooltip.
- `src/client/pages/AdminVolunteersPage.tsx`: Add magic link portal URL box with "Copy Link" and "Reset Link" actions.
- `src/client/components/HeadcountCalendar.tsx`: Prepend weekday offset padding cells so calendar columns align strictly Monday through Sunday, and render `Mon`–`Sun` header row.
