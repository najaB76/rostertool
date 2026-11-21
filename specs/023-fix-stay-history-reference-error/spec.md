# Feature Specification: Fix Stay History Modal ReferenceError

**Feature Branch**: `023-fix-stay-history-reference-error`

**Created**: 2026-10-27

**Status**: Draft

**Input**: User feedback:
"DEFECT: The inline review editor added in the most recent spec is not working. Clicking the `Stays` link results in a blank page, with the following error in the browser console: `Uncaught ReferenceError: loadVolunteers is not defined`"

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Open Stay History and Edit Reviews Without ReferenceError (Priority: P1)

As a hostel coordinator viewing volunteer cards on `/admin/volunteers`, I want to click the "Stays" link for any volunteer to open the Stay History modal without crashing the application with a `ReferenceError`, and I want saving an edited review to refresh the volunteer list seamlessly.

**Why this priority**: A typo referencing `loadVolunteers` instead of `fetchVolunteers` causes an unhandled runtime error that blanks the entire page whenever a user attempts to view a volunteer's stay history.

**Independent Test**:
- Navigate to `/admin/volunteers`.
- Find any volunteer and click their "Stays" link.
- Verify the modal opens immediately without throwing `ReferenceError: loadVolunteers is not defined` and the page remains interactive.
- In the modal, click "Edit Review", modify the rating or notes, and click "Save Review".
- Verify the review saves, the modal updates, and the volunteer card refreshes without console errors.

**Acceptance Scenarios**:
1. **Given** any volunteer on `/admin/volunteers`, **When** clicking their "Stays" link, **Then** `StayHistoryModal` opens cleanly with no runtime exception.
2. **Given** `StayHistoryModal` is open, **When** a stay review is edited and saved, **Then** `onStayUpdated` triggers `fetchVolunteers` to reload volunteer records with updated star ratings.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: In `AdminVolunteersPage.tsx`, the `StayHistoryModal` callback `onStayUpdated` MUST reference the defined function `fetchVolunteers` rather than undefined `loadVolunteers`.
- **FR-002**: Opening `StayHistoryModal` MUST NOT produce any uncaught JavaScript exceptions or blank the page.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 0 `ReferenceError` crashes or blank pages when clicking "Stays" across 100% of volunteer records.
- **SC-002**: Updated star ratings and notes are reflected on the volunteer list within 300ms of saving an edited review.
