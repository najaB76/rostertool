# Feature Specification: Volunteer Profile Pictures and CSS Style Decoupling

**Feature Branch**: `031-volunteer-profile-pictures-and-css`

**Created**: 2026-10-27

**Status**: Draft

**Input**: User feedback:
1. IMPROVEMENT: Remove hard-coded styling on HTML elements. Ensure that all elements get their styling from CSS and that the styles are applied consistently in both dark and light mode.
2. NEW: There is a new requirement to have a profile picture associated with volunteer records. The admin user should be able to add, update, or remove the profile picture in the volunteer edit screen. When viewing the volunteer details the profile picture should be displayed as a thumbnail next to the preferred name field, and clicking on the thumbnail should open the full-sized image in a modal overlay that can be dismissed by clicking on a close control (X) or by pressing the escape key.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Add, Update, and Remove Volunteer Profile Picture (Priority: P1)

As a hostel administrator, I want to add, update, or remove a profile photo for any volunteer within the volunteer edit dialog, so that staff can visually identify volunteers arriving or staying at the property.

**Why this priority**: Hostel operations require rapid visual identification of volunteers on site, during check-in, and while assigning operational duties.

**Independent Test**:
- Open `/admin/volunteers` and click an existing volunteer to edit (or click "+ Add Volunteer").
- In `VolunteerModal`, locate the profile picture section next to or above the name fields.
- Upload an image file (e.g. JPG, PNG, WebP) $\rightarrow$ verify instant visual preview of the thumbnail.
- Click "Save Volunteer" $\rightarrow$ verify the image is saved to the volunteer record.
- Re-open the volunteer edit dialog $\rightarrow$ verify the photo is loaded and displayed.
- Click "Remove Photo" $\rightarrow$ verify photo is cleared and changes persist upon save.

**Acceptance Scenarios**:
1. **Given** the volunteer edit screen, **When** an admin selects an image file, **Then** the image preview renders immediately as a circular or rounded thumbnail.
2. **Given** a volunteer with an existing photo, **When** the admin clicks "Remove Photo" and saves, **Then** the photo is removed from the record.
3. **Given** an invalid or non-image file, **When** selected, **Then** a friendly validation message is displayed.

---

### User Story 2 - Profile Picture Thumbnail & Full-Sized Lightbox Overlay (Priority: P1)

As a hostel administrator viewing volunteer details, I want to see a thumbnail of the volunteer's profile picture next to their preferred name, and I want clicking the thumbnail to open a full-sized image in a modal overlay that can be dismissed via an (X) button or by pressing the Escape key.

**Why this priority**: Coordinators need a fast way to verify a volunteer's identity by viewing a larger, clear image without leaving the current view.

**Independent Test**:
- Open the volunteer edit dialog (or volunteer details view).
- Verify the profile picture thumbnail appears neatly aligned next to the preferred name field.
- Click the thumbnail $\rightarrow$ verify a full-sized image overlay modal opens centered with a darkened backdrop.
- Press the `Escape` key on the keyboard $\rightarrow$ verify the modal closes immediately.
- Click the thumbnail again to open the overlay $\rightarrow$ click the close button `(✕)` in the top corner $\rightarrow$ verify the modal closes.
- Click the dark backdrop outside the image $\rightarrow$ verify the modal closes.

**Acceptance Scenarios**:
1. **Given** a volunteer record with a profile picture, **When** viewing the volunteer details, **Then** a thumbnail is displayed adjacent to the preferred name.
2. **Given** the full-sized image modal is open, **When** the user clicks `✕`, clicks the overlay backdrop, or presses `Escape`, **Then** the modal overlay closes smoothly.

---

### User Story 3 - CSS Decoupling and Consistent Theme Styling (Priority: P2)

As a developer and administrator, I want components and layouts to derive their presentation from structured CSS classes and CSS custom properties in `main.css` rather than ad-hoc inline styles, ensuring that all elements render consistently with optimal contrast in both light and dark modes.

**Why this priority**: Ad-hoc inline styles cause theme divergence, specificity battles, and contrast defects across dark and light modes.

**Independent Test**:
- Inspect components across the application in both light and dark modes.
- Verify elements utilize semantic CSS classes (`.photo-thumbnail`, `.photo-lightbox-modal`, `.form-card`, `.input-control`, etc.).
- Verify zero regressions in visual presentation or contrast ratios across all pages in both light and dark themes.

**Acceptance Scenarios**:
1. **Given** any styled element, **When** rendered in light or dark mode, **Then** its presentation is governed by CSS classes and CSS variables without hardcoded conflicting inline styles.
2. **Given** theme toggling between light and dark modes, **When** switched, **Then** all profile picture controls, dialogs, and forms adapt their backgrounds and borders smoothly.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The database schema for `volunteers` MUST support storing a profile picture (e.g. data URL or image path).
- **FR-002**: In `VolunteerModal.tsx`, administrators MUST be able to upload a new profile picture, replace an existing picture, or remove the current picture.
- **FR-003**: When viewing volunteer details in `VolunteerModal.tsx` and on volunteer cards in `AdminVolunteersPage.tsx`, the profile picture MUST render as a thumbnail adjacent to the preferred name.
- **FR-004**: Clicking on the thumbnail MUST trigger a full-sized image modal overlay (lightbox).
- **FR-005**: The image modal overlay MUST be dismissible via:
  1. Clicking a dedicated close control (`✕`).
  2. Pressing the `Escape` keyboard key.
  3. Clicking outside the image area on the modal backdrop.
- **FR-006**: Profile picture components (thumbnail, upload button, remove button, modal overlay, close button) MUST be styled with semantic CSS classes that support both light and dark modes.
- **FR-007**: Inline styling on volunteer forms, cards, and image overlays MUST be replaced with semantic CSS classes in `main.css`.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of volunteer records can store, update, and remove a profile picture.
- **SC-002**: Clicking a thumbnail displays the full-sized image overlay in $< 100\text{ms}$.
- **SC-003**: 100% of full-sized image modal overlays close immediately upon pressing `Escape` or clicking `✕`.
- **SC-004**: Zero inline hardcoded styling conflicts for profile pictures and associated modal controls.
- **SC-005**: Contrast ratio meets or exceeds WCAG AA (4.5:1) in both light and dark themes for all new elements.
