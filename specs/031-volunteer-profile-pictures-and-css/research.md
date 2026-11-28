# Research & Technical Decisions: Volunteer Profile Pictures and CSS Style Decoupling

**Feature**: `031-volunteer-profile-pictures-and-css`
**Date**: 2026-10-27
**Status**: Completed

## 1. Profile Picture Storage and Management

- **Storage Format**: Store compressed / downscaled base64 Data URLs directly in SQLite `volunteers.profile_picture` column.
- **Why Data URL in SQLite**:
  - Zero external cloud/S3 dependencies (strictly adhering to Constitution Principle III: Self-Hosted Simplicity & Zero-Config).
  - Preserved automatically in `.sqlite` database backups without needing separate media folder sync.
  - Client-side downscaling (max $800 \times 800$px JPEG/WebP) ensures small record payloads ($< 100$KB per image).
- **CRUD Operations**:
  - **Add**: File input allows uploading PNG, JPEG, or WebP. Client converts to Data URL and sets in state.
  - **Update**: Re-uploading a new image updates the preview and state.
  - **Remove**: Dedicated remove button clears `profilePicture` to `null`.

## 2. Thumbnail Display and Lightbox Overlay

- **Placement**:
  - In `VolunteerModal`, displayed next to the preferred name / full name fields as a clickable thumbnail with overlay hover indicator.
  - In `AdminVolunteersPage`, displayed on volunteer cards adjacent to preferred name.
- **Lightbox Modal Overlay**:
  - Accessible via click on any profile picture thumbnail.
  - Shows full-sized image with clean centered layout and dimmed semi-transparent backdrop.
  - Close mechanisms:
    1. Clicking the close button (`✕`) in the top-right corner.
    2. Pressing the `Escape` key on the keyboard.
    3. Clicking outside the image area on the modal backdrop.

## 3. CSS Decoupling and Consistent Theme Styling

- **De-inlining Strategy**:
  - Define reusable classes in `main.css`:
    - `.modal-overlay`, `.modal-dialog`, `.modal-header`, `.modal-footer`
    - `.form-group`, `.form-row`, `.form-label`, `.form-input`, `.form-select`, `.form-textarea`
    - `.profile-thumbnail`, `.profile-upload-btn`, `.profile-remove-btn`
    - `.lightbox-overlay`, `.lightbox-container`, `.lightbox-image`, `.lightbox-close`
  - Remove repetitive inline styles (`style={{ background: '#fff', border: ... }}`) from JSX.
  - Leverage `:root` and `html.dark` CSS variables to guarantee consistent presentation across themes without CSS specificity conflicts.
