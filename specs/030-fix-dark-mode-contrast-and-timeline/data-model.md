# Data Model: Dark Mode Contrast, Timeline Cell Fills, and Active State Differentiation

**Feature**: `030-fix-dark-mode-contrast-and-timeline`
**Date**: 2026-10-27
**Status**: Completed

## Dark Theme Semantic Palette Tokens

### Status Badges & Timeline Status Buttons

| Status | Light Theme (BG / Text / Border) | Dark Theme (BG / Text / Border) |
|---|---|---|
| **Active** (In da house) | `#dcfce7` / `#166534` / `#bbf7d0` | `#14532d` / `#86efac` / `#166534` |
| **Accepted** (Confirmed) | `#dbeafe` / `#1e40af` / `#bfdbfe` | `#1e3a8a` / `#93c5fd` / `#1d4ed8` |
| **Applied** (Not confirmed) | `#fef9c3` / `#854d0e` / `#fef08a` | `#713f12` / `#fde047` / `#854d0e` |
| **Departed** | `#f1f5f9` / `#475569` / `#e2e8f0` | `#334155` / `#cbd5e1` / `#475569` |
| **Cancelled** | `#fee2e2` / `#991b1b` / `#fecaca` | `#450a0a` / `#fca5a5` / `#7f1d1d` |

### Action Hierarchy Tokens

| Action Role | Light Theme | Dark Theme |
|---|---|---|
| **Primary / Submit** (`.btn-primary`) | `#2563eb` bg / `#ffffff` text | `#2563eb` bg / `#ffffff` text |
| **Secondary / Cancel** (`.btn-cancel`) | `#f4f4f5` bg / `#3f3f46` text | `#334155` bg / `#cbd5e1` text |
| **Danger / Delete** (`.btn-danger`) | `#fee2e2` bg / `#991b1b` text | `#7f1d1d` bg / `#fca5a5` text |
| **Active Tab** (`.tab-button.active`) | `#2563eb` bg / `#ffffff` text | `#2563eb` bg / `#ffffff` text |
| **Inactive Tab** (`.tab-button`) | `#f1f5f9` bg / `#475569` text | `#1e293b` bg / `#94a3b8` text |
