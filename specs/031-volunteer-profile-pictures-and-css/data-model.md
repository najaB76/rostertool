# Data Model: Volunteer Profile Pictures and CSS Style Decoupling

**Feature**: `031-volunteer-profile-pictures-and-css`
**Date**: 2026-10-27
**Status**: Completed

## Schema Updates

### Table: `volunteers`

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `profile_picture` | `TEXT` | YES | `NULL` | Base64 Data URL (e.g. `data:image/jpeg;base64,...`) or image URI |

## UI State Entities

### Profile Picture Actions
- `addProfilePicture(file: File): Promise<string>` - Resizes image and yields base64 Data URL.
- `removeProfilePicture(): void` - Sets `profilePicture` to `null`.
- `openLightbox(imageUrl: string): void` - Activates the lightbox modal.
- `closeLightbox(): void` - Dismisses the lightbox modal.

## CSS Component Classes

| Semantic Class | Target Element | Light Mode | Dark Mode |
|---|---|---|---|
| `.profile-thumbnail` | Thumbnail `<img>` | Border: `#e2e8f0` | Border: `#334155` |
| `.lightbox-overlay` | Modal Backdrop | `rgba(0,0,0,0.75)` | `rgba(0,0,0,0.85)` |
| `.lightbox-container` | Modal Image Card | Background: `#ffffff` | Background: `#1e293b` |
| `.lightbox-close` | Dismiss Button `✕` | Background: `#f4f4f5` | Background: `#334155` |
