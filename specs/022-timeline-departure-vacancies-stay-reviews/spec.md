# Feature Specification: Timeline Departure Date Integrity, Daily Vacancies Row, and Editable Stay Reviews

**Feature Branch**: `022-timeline-departure-vacancies-stay-reviews`

**Created**: 2026-10-27

**Status**: Draft

**Input**: User feedback from `feedback.txt`:
1. BUG: When the user scrolls forward in the timeline some volunteer's departure dates get replaced by '????'. This results in them showing on the timeline indefinitely. The dates are not changed in the database. The API call to the 'timeline' endpoint is captured in @timeline_issue.har and the departure date for volunteer with is `12c5b187-e201-41fd-94cf-90f9240f557d` changes from `2026-12-05` to `null` between the two calls.
2. IMPROVEMENT: On the timeline view can we add a row below `Total CONFIRMED Volunteers` that indicates how many vacancies are available based on the total number of confirmed volunteers subtracted from the baseline target configured in the settings page.
3. IMPROVEMENT: Can the review of past stays (number of stars) be editable. If the user accidentally selects the wrong rating the only way to change it would be editing the database directly.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Fix Departure Date Null Overwrite on Forward Timeline Scroll (Priority: P1)

As a hostel manager scrolling forward on the Staffing Timeline past a volunteer's departure date, I want their stay bar to end exactly on their scheduled departure date and not reappear indefinitely with '????' departure dates, so that the timeline accurately reflects when volunteers depart and does not show departed volunteers on future dates.

**Why this priority**: When scrolling forward beyond a volunteer's actual departure date, an outdated or unsynchronized stay record in `volunteer_stays` with `departureDate: null` was being evaluated as an open-ended stay, causing the volunteer to be rendered across all future weeks with `????` and inflating future capacity.

**Independent Test**:
- Create a volunteer with `arrivalDate: '2026-11-06'` and `departureDate: '2026-12-05'` (`noEndDate: false`).
- Ensure `volunteer_stays` has a corresponding record.
- Query `/api/admin/timeline?startDate=2026-11-16&weeks=5` $\rightarrow$ verify volunteer appears with `departureDate: '2026-12-05'` and stay bar ending on `2026-12-05`.
- Query `/api/admin/timeline?startDate=2026-12-21&weeks=5` $\rightarrow$ verify the volunteer does **NOT** appear in the `2026-12-21` to `2027-01-24` timeline window, does **not** have `departureDate: null`, and is **not** rendered with `????`.

**Acceptance Scenarios**:
1. **Given** a volunteer with an established `departureDate` on `volunteers`, **When** querying timeline windows occurring after their departure date, **Then** an un-synchronized or null `departureDate` from `volunteer_stays` with the same arrival date MUST NOT override the real departure date or spawn a phantom open-ended stay.
2. **Given** updates to a volunteer's stay dates in `updateVolunteer`, **When** saved, **Then** both `volunteers` and the corresponding active stay in `volunteer_stays` are synchronized.
3. **Given** a volunteer who departed on date $D$, **When** scrolling to dates after $D$, **Then** they do not appear in future operational rows or bed counts.

---

### User Story 2 - Daily Bed Vacancies Calculation Row on Timeline (Priority: P1)

As a hostel coordinator planning volunteer recruitment on the Staffing Timeline, I want a dedicated "Vacancies Available" row directly beneath the "Total CONFIRMED Volunteers" row showing the number of available beds (`Baseline Target - Confirmed Volunteers`) for each day, so that I can immediately identify shortfalls and know exactly how many volunteers need to be recruited for each date.

**Why this priority**: Coordinators previously had to mentally subtract the daily confirmed count from the baseline setting for all 35+ days on screen. An automated row provides instant capacity gap visibility.

**Independent Test**:
- Set Baseline Target to `11` in Settings.
- Open `/admin/timeline`.
- Inspect the row directly below "Total CONFIRMED Volunteers".
- On a day with `8` confirmed volunteers, verify the cell displays `3` vacancies available.
- On a day with `11` confirmed volunteers, verify the cell displays `0` vacancies.
- On a day with `12` confirmed volunteers (overbooked), verify the cell displays `0` (or `+1 over target`) with clear tooltip.

**Acceptance Scenarios**:
1. **Given** the timeline table, **When** rendered, **Then** a row titled "Vacancies Available" (or "Vacancies (vs Target)") is displayed immediately below "Total CONFIRMED Volunteers".
2. **Given** daily confirmed count $C$ and configured baseline target $B$, **When** $C < B$, **Then** the cell displays $B - C$ with positive vacancy styling (e.g. emerald/green badge or text indicating available beds).
3. **Given** $C \ge B$, **When** calculated, **Then** the cell displays `0` vacancies available.
4. **Given** hovering over a vacancy cell, **When** hovered, **Then** a tooltip explains: `${vacancies} vacancies available (Target: ${baseline}, Confirmed: ${count})`.

---

### User Story 3 - Editable Past Stay Reviews & Star Ratings (Priority: P2)

As a hostel coordinator managing volunteer records, I want to edit the star rating, departure review notes, and rehire status of any past stay in the Stay History modal (`StayHistoryModal`), so that accidental rating mistakes can be corrected directly without requiring manual database modification.

**Why this priority**: Currently, once a departure review is submitted, it is permanent in the UI. If a user accidentally enters 1 star instead of 5 stars, they cannot correct it in the app.

**Independent Test**:
- Open `/admin/volunteers`, click "Stay History" for a volunteer with a completed review (e.g. 3 stars).
- Click "Edit Review" on that stay record.
- Change the rating to 5 stars, update the review notes, and change rehire status to "Accept".
- Click "Save Review".
- Verify the modal and volunteer card immediately update to show 5 stars and updated notes.

**Acceptance Scenarios**:
1. **Given** a stay record with a completed review in `StayHistoryModal`, **When** clicking "Edit Review", **Then** an inline editor or modal appears allowing modification of `departureRating` (1-5 stars), `departureNotes`, and `rehireStatus`.
2. **Given** submitting the updated review via `PUT /api/admin/volunteers/:id/stays/:stayId`, **When** processed, **Then** the `volunteer_stays` record is updated in the database and the UI immediately refreshes.
3. **Given** the volunteer card on `/admin/volunteers`, **When** the latest stay review is edited, **Then** the latest star rating displayed on the volunteer card updates to match.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: `/api/admin/timeline` MUST NOT emit phantom open-ended stays with `departureDate: null` for a volunteer when their authoritative stay has a defined `departureDate`.
- **FR-002**: When consolidating stays for a volunteer in `admin-timeline.ts`, if a stay record in `volunteer_stays` shares the same `arrivalDate` as the volunteer's current record, the defined `departureDate` from `volunteers` MUST take precedence over `null`.
- **FR-003**: In `volunteer-service.ts` (`updateVolunteer`), updating `departureDate` or `noEndDate` MUST synchronize the corresponding active record in `volunteer_stays`.
- **FR-004**: In `AdminTimelinePage.tsx`, a summary row titled "Vacancies Available" MUST be displayed immediately beneath "Total CONFIRMED Volunteers".
- **FR-005**: For each day column, the Vacancies row MUST calculate `Math.max(0, baseline - dailyConfirmedCount)`.
- **FR-006**: In `StayHistoryModal.tsx`, each stay with a review MUST provide an edit action allowing coordinators to modify the rating (1 to 5 stars), departure notes, and rehire status.
- **FR-007**: The backend `adminVolunteersRoutes` MUST support `PUT /api/admin/volunteers/:id/stays/:stayId` to update a stay's review details (`departureRating`, `departureNotes`, `rehireStatus`).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 0 phantom stays with `departureDate: null` or `'????'` when scrolling forward on `/admin/timeline` for volunteers with defined departure dates.
- **SC-002**: 100% of calendar day columns on `/admin/timeline` display accurate vacancies available matching `baseline - confirmed`.
- **SC-003**: Coordinators can correct any past stay star rating in `StayHistoryModal` and have the update persist in < 200ms.
- **SC-004**: 0 regressions in historical staffing views or stay history integrity.
