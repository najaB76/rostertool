# Data Model: Systemic CSS Decoupling and Universal Dark Mode Theme Architecture

**Feature**: `032-systemic-css-decoupling`
**Date**: 2026-10-27
**Status**: Completed

## Design Token Contract

```css
:root {
  --bg-app: #f4f4f5;
  --bg-card: #ffffff;
  --bg-muted: #f8fafc;
  --bg-header: #18181b;
  --text-main: #0f172a;
  --text-secondary: #64748b;
  --border-color: #e2e8f0;
}

html.dark {
  --bg-app: #0b0f19;
  --bg-card: #1e293b;
  --bg-muted: #0f172a;
  --bg-header: #06090e;
  --text-main: #f8fafc;
  --text-secondary: #94a3b8;
  --border-color: #334155;
  color-scheme: dark;
}
```

## Standardized Class Taxonomy

| Class Name | Applied Elements | Light Mode Presentation | Dark Mode Presentation |
|---|---|---|---|
| `.modal-overlay` | Fixed backdrop container | `rgba(0, 0, 0, 0.5)` | `rgba(0, 0, 0, 0.7)` |
| `.modal-card` | Modal window container | `var(--bg-card)` (`#fff`) | `var(--bg-card)` (`#1e293b`) |
| `.modal-title` | Modal header `<h3>` | `var(--text-main)` (`#0f172a`) | `var(--text-main)` (`#f8fafc`) |
| `.form-group` | Form row or field container | `display: flex; flex-direction: column` | Inherits layout |
| `.form-label` | Field `<label>` | `var(--text-main)`, `font-weight: 600` | `var(--text-main)`, `font-weight: 600` |
| `.form-input` | Text/date `<input>` | Background `var(--bg-card)`, Border `var(--border-color)` | Background `var(--bg-muted)`, Border `var(--border-color)` |
| `.form-select` | `<select>` control | Background `var(--bg-card)`, Border `var(--border-color)` | Background `var(--bg-muted)`, Border `var(--border-color)` |
| `.form-textarea` | `<textarea>` control | Background `var(--bg-card)`, Border `var(--border-color)` | Background `var(--bg-muted)`, Border `var(--border-color)` |
| `.card` | Section/page cards | Background `var(--bg-card)`, Border `var(--border-color)` | Background `var(--bg-card)`, Border `var(--border-color)` |
| `.toolbar` | Action & navigation bars | Background `var(--bg-card)`, Border `var(--border-color)` | Background `var(--bg-card)`, Border `var(--border-color)` |
