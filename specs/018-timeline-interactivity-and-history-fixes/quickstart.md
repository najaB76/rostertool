# Quickstart: Timeline Interactivity, Historical Staffing, and Volunteer Edit Enhancements

**Feature**: `018-timeline-interactivity-and-history-fixes`

## Validation Scenarios

### Scenario 1: Historical Timeline View
1. Set a volunteer's stay in the past (e.g. 2 months ago) and mark them `Departed`.
2. Scroll the timeline back to that date window.
3. Verify the volunteer appears in their role row (Reception or Housekeeping) with their stay bar rendered and counted in daily confirmed counts.

### Scenario 2: Timeline Direct Actions
1. Click a volunteer's name on `/admin/timeline`. Verify `VolunteerModal` opens. Save changes and verify the timeline refreshes.
2. Click an 'In da house' status pill. Click 'Depart'. Verify `DepartureModal` opens, complete departure, and verify status updates to 'Departed' on the timeline.

### Scenario 3: Running Total for Applied Candidates
1. View the Unconfirmed section on `/admin/timeline`.
2. Verify "Total APPLIED Candidates" summary row is rendered at the bottom displaying daily counts.

### Scenario 4: Source Synchronization
1. Edit a volunteer, choose source 'HelpX'. Save.
2. Verify both volunteer card and timeline display 'HelpX' (not 'Other').

### Scenario 5: Resizable & Esc Key
1. Open `VolunteerModal`.
2. Press `Esc` key $\to$ modal closes immediately.
3. Drag modal resize corner $\to$ modal smoothly resizes.
