# Feature Specification: Global Date Format Synchronization Across All Views

**Feature Branch**: `015-global-date-format-sync`

**Created**: 2026-10-27

**Status**: Draft

**Input**: User bug report: "FIX: The date format selection in the settings tab only changes the format in date selectors. It does not change the format displayed in the volunteer management page, the weekly roster, the timeline, the headcount page, or in time off management."

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Global Application of Date Format Setting (Priority: P1)

As a hostel administrator, when I select a date format preference (`DD-MM-YYYY` or `YYYY-MM-DD`) on the Settings page, I want all date displays throughout the application (Volunteer Management, Weekly Roster, Timeline, Headcount, and Time Off Management) to instantly and consistently format according to my selection, so that the entire system honors my chosen date convention.

**Why this priority**: Users in European and international contexts expect dates to be consistently displayed as `DD-MM-YYYY`. Currently, setting `DD-MM-YYYY` is ignored across all readouts, cards, headers, and grids, leaving them permanently in `YYYY-MM-DD`.

**Independent Test**:
1. Navigate to `/admin/settings` and select Date Format: `DD-MM-YYYY`. Save settings.
2. Navigate to `/admin/volunteers`:
   - Verify volunteer stay dates are displayed as `DD-MM-YYYY` (e.g., `09-11-2026` instead of `2026-11-09`).
3. Navigate to `/admin/roster`:
   - Verify week header banner and daily column dates display in `DD-MM-YYYY` (e.g., `09-11-2026`).
4. Navigate to `/admin/timeline`:
   - Verify Arrival and Departure columns display dates in `DD-MM-YYYY`.
5. Navigate to `/admin/headcount`:
   - Verify date ranges and calendar day tooltips/headers display in `DD-MM-YYYY`.
6. Navigate to `/admin/time-off`:
   - Verify requested time-off dates display in `DD-MM-YYYY`.
7. Return to `/admin/settings`, switch to `YYYY-MM-DD`, save, and verify all views revert to `YYYY-MM-DD`.

**Acceptance Scenarios**:
1. **Given** `dateFormatPreference` is set to `'DD-MM-YYYY'`, **When** viewing the volunteer management page, **Then** all stay dates, arrival dates, and departure dates render in `DD-MM-YYYY` format.
2. **Given** `dateFormatPreference` is set to `'DD-MM-YYYY'`, **When** viewing the weekly roster, **Then** week period ranges and daily shift headers render in `DD-MM-YYYY` format.
3. **Given** `dateFormatPreference` is set to `'DD-MM-YYYY'`, **When** viewing the staffing timeline, **Then** the Arrival and Departing columns render in `DD-MM-YYYY` format.
4. **Given** `dateFormatPreference` is set to `'DD-MM-YYYY'`, **When** viewing the headcount page, **Then** the navigation date range and day displays render in `DD-MM-YYYY` format.
5. **Given** `dateFormatPreference` is set to `'DD-MM-YYYY'`, **When** viewing the time off management page, **Then** time-off request dates render in `DD-MM-YYYY` format.
6. **Given** the underlying database storage and API communication, **Then** all internal ISO representations strictly remain `YYYY-MM-DD`.

---

## Edge Cases

- **Invalid or Null Date Values**: Returns empty string or fallback gracefully without errors.
- **Date Inputs (`<input type="date">`)**: Native browser date pickers handle internal input values in `YYYY-MM-DD`, while visual text labels and readonly previews display the preferred format.
- **Single-Digit Days and Months**: Formatted with leading zeros (`05-02-2026`) for clean visual alignment in tables.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The application MUST provide a global date formatting context/service accessible to all React components.
- **FR-002**: The date formatting service MUST synchronize with the `date_format_preference` stored in `system_settings` (`YYYY-MM-DD` or `DD-MM-YYYY`).
- **FR-003**: The volunteer management page (`AdminVolunteersPage` and `StayHistoryModal`) MUST format all stay dates using the global date format preference.
- **FR-004**: The weekly roster page (`AdminRosterPage`, `RosterGrid`, and `PrintableRosterView`) MUST format all calendar and shift dates using the global date format preference.
- **FR-005**: The staffing timeline view (`AdminTimelinePage`) MUST format Arrival and Departing dates using the global date format preference.
- **FR-006**: The capacity headcount page (`AdminHeadcountPage` and `HeadcountCalendar`) MUST format period range subtitles and day headers using the global date format preference.
- **FR-007**: The time-off management page (`AdminTimeOffPage`) MUST format all requested dates using the global date format preference.
- **FR-008**: Changing the date format on `/admin/settings` MUST immediately propagate to all pages without requiring a manual browser refresh or cache clear.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of visible date text readouts across all 5 admin pages (Volunteers, Roster, Timeline, Headcount, Time Off) match the active date format preference.
- **SC-002**: 0 instances of hardcoded `YYYY-MM-DD` strings displayed in UI text when `DD-MM-YYYY` is active.
- **SC-003**: Updating the date format setting propagates to all application views in < 500ms.
- **SC-004**: 0 regressions in database storage or backend queries (internal storage remains strictly ISO `YYYY-MM-DD`).
