# Quickstart: Dark Mode Contrast, Timeline Cell Fills, and Active State Differentiation

**Feature**: `030-fix-dark-mode-contrast-and-timeline`

## Verification Scenarios

### Scenario 1: Timeline Cell Fills & Status Button Colors
1. Enable Dark Mode.
2. Open `/admin/timeline`.
3. Verify occupied stay cells display solid color fills (`barColor`).
4. Verify departure day cells display hatched diagonal patterns.
5. Verify status buttons display green for "In da house", blue for "Confirmed", amber for "Not confirmed", and red for "Departed".
6. Open the status menu: verify action options have distinct red, green, and blue text colors.

### Scenario 2: Active Tab & Primary/Cancel Differentiation
1. In dark mode, open `/admin/volunteers`.
2. Click different filter tabs ("In da house", "Confirmed", etc.): verify active tab is highlighted in blue (`#2563eb`) with white text, and inactive tabs are dark gray (`#1e293b`).
3. Open `VolunteerModal`: verify "Save Volunteer" is blue and "Cancel" is neutral dark slate (`#334155`).

### Scenario 3: Status Pills Contrast
1. In dark mode on `/admin/volunteers`, inspect a "Cancelled" volunteer card.
2. Verify the `Cancelled` pill has a dark red background (`#450a0a`) with bright red text (`#fca5a5`), with no light-on-light artifact.
3. Verify `Active`, `Accepted`, `Applied`, and `Departed` status pills are clearly legible.
