# Research & Technical Decisions: Systemic CSS Decoupling and Universal Dark Mode Theme Architecture

**Feature**: `032-systemic-css-decoupling`
**Date**: 2026-10-27
**Status**: Completed

## 1. Root Cause of "Edit Volunteer" White-on-White Regression

- **The Failure Mechanism**:
  - `VolunteerModal.tsx` set inline styles on its card container:
    `style={{ position: 'relative', background: '#fff', width: `${modalSize.width}px`, ... }}`.
  - In `main.css`, dark mode attempted to override this using:
    `html.dark div[style*="position: fixed"] > div[style*="background: #fff"]`.
  - When React renders dynamic styles (e.g. width/height in pixels) or when browser engines serialize styles into `style="background: rgb(255, 255, 255); ..."`, the literal substring `background: #fff` was missing.
  - Consequently, the modal card background was NOT changed to `#1e293b` and remained white `#ffffff`.
  - However, `html.dark div[style*="position: fixed"] h3 { color: #f8fafc !important; }` DID match because it only checked for `h3` inside `div[style*="position: fixed"]`.
  - Result: White text (`#f8fafc`) rendered directly against a white surface (`#ffffff`).

## 2. Architecture: Pure Class-Based Design Token System

To permanently eradicate this entire class of bugs:
- **No element should rely on CSS attribute selectors targeting inline styles.**
- All modals adopt `.modal-overlay`, `.modal-card`, `.modal-header`, `.modal-title`, `.modal-body`, `.modal-footer`.
- Design tokens defined in `:root` and `html.dark`:
  - `--bg-app`: `#f4f4f5` (light) / `#0b0f19` (dark)
  - `--bg-card`: `#ffffff` (light) / `#1e293b` (dark)
  - `--bg-muted`: `#f8fafc` (light) / `#0f172a` (dark)
  - `--text-main`: `#0f172a` (light) / `#f8fafc` (dark)
  - `--text-muted`: `#64748b` (light) / `#94a3b8` (dark)
  - `--border-color`: `#e2e8f0` (light) / `#334155` (dark)
- Modals, cards, toolbars, and form controls consume these tokens directly.
- The modal card background is ALWAYS `--bg-card` and title is ALWAYS `--text-main`, guaranteeing 100% synchronized, high-contrast rendering in both light and dark modes.
