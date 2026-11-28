# Quickstart: Systemic CSS Decoupling and Universal Dark Mode Theme Architecture

**Feature**: `032-systemic-css-decoupling`

## Verification Scenarios

### Scenario 1: Volunteer Modal Dark Mode Contrast Verification
1. Enable Dark Mode.
2. Navigate to `/admin/volunteers`.
3. Click any volunteer to open the "Edit Volunteer" dialog.
4. Verify the modal card background is dark slate (`#1e293b`).
5. Verify the heading text ("Edit Volunteer (Active)") is crisp white (`#f8fafc`).
6. Verify no white-on-white text or light-on-light artifacts exist.
7. Switch to Light Mode $\rightarrow$ verify modal card is clean white (`#ffffff`) and heading text is dark (`#0f172a`).

### Scenario 2: All Modals Theme Consistency
1. In Dark Mode, open and verify:
   - `DepartureModal`: Dark card, light text, red confirm button, neutral cancel button.
   - `ReactivateModal`: Dark card, light text, green confirm button, neutral cancel button.
   - `StayHistoryModal`: Dark card, light text, review ratings clearly visible.
   - `ChangePinModal`: Dark card, light text, inputs styled with dark backgrounds.
   - `ImageLightboxModal`: Dark backdrop, high-contrast close button.

### Scenario 3: Page Surfaces and Form Controls
1. Navigate across all 8 views in Dark Mode:
   - Volunteers filter bar & cards
   - Timeline full-width columns & sticky cells
   - Headcount toolbar & calendar cards
   - Weekly roster day columns & shift slots
   - Admin users cards & new user form
   - Settings form cards
   - Reports dashboard cards & tables
2. Verify all elements derive background, text, and border styling from CSS classes and CSS variables with WCAG AA compliance.
