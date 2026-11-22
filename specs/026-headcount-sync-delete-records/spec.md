# Feature Specification: Headcount In-House Synchronization and Record Deletion

**Feature Branch**: `026-headcount-sync-delete-records`

**Created**: 2026-10-27

**Status**: Draft

**Input**: User feedback:
"BUG: The headcount view is not working. It does not count all in-house volunteers for each day. As an example on 2026-11-27 it shows 8 as the count, but on the timeline view there are 13. The count of in-house volunteers on the headcount page should match the timeline view for all days.
IMPROVEMENT: The historical database import has resulted in some duplication, but there is no way to delete the duplicates in-app. The requirement is that an admin user should be able to clearly delete stay records and volunteer records without leaving orphaned records in the database."

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Synchronize Headcount Daily In-House Count with Timeline (Priority: P1)

As a hostel coordinator viewing the Daily Headcount page (`/admin/headcount`), I want the daily count of in-house volunteers to match the Staffing Timeline view (`/admin/timeline`) for all days, including volunteers with open-ended stays (`noEndDate: true`) and confirmed volunteers, so that staffing metrics are 100% consistent across all operational views.

**Why this priority**: Previously, the headcount service filtered with `isNotNull(volunteers.departureDate)` and only checked the static `volunteers.status`, completely excluding volunteers with open-ended stays or historical stays. This created discrepancies (e.g., 8 on headcount vs 13 on timeline on 2026-11-27).

**Independent Test**:
- Open `/admin/timeline` and note the "Total CONFIRMED Volunteers" count on date `2026-11-27` (e.g. 13).
- Open `/admin/headcount` for the date range covering `2026-11-27`.
- Verify the headcount for `2026-11-27` displays exactly the same count (13).
- Verify hovering or viewing the volunteer roster for that day lists the exact same set of in-house confirmed volunteers.

**Acceptance Scenarios**:
1. **Given** any date $D$, **When** viewing the headcount on date $D$, **Then** the count of in-house volunteers matches the timeline's confirmed volunteer count for date $D$.
2. **Given** a volunteer with `noEndDate: true` or `departureDate == null`, **When** their arrival date $\le D$, **Then** they are counted in the headcount for date $D$.
3. **Given** a volunteer departing on date $D$, **When** calculating overnight bed demand for night $D$, **Then** they are excluded on their departure date ($D$) matching the timeline logic (`departureDate > D`).

---

### User Story 2 - In-App Volunteer Deletion Without Orphaned Records (Priority: P1)

As an administrator managing volunteer profiles, I want to permanently delete duplicate or invalid volunteer records directly from the UI, with complete cascading deletion of all associated shift assignments, time-off requests, reviews, and stay records, so that duplicate entries from historical imports can be cleaned up without leaving orphaned database rows.

**Why this priority**: When duplicate volunteers are created during migrations or imports, administrators must be able to remove duplicates directly in the web app rather than executing raw SQL.

**Independent Test**:
- Create a test volunteer with an assigned shift, a time-off request, and a stay record.
- In `AdminVolunteersPage` (or `VolunteerModal`), click "Delete Volunteer".
- Confirm the deletion prompt.
- Verify the volunteer is removed from the UI list.
- Query SQLite: verify 0 orphaned records remain in `volunteers`, `volunteer_stays`, `stay_reviews`, `shift_assignments`, or `time_off_requests`.

**Acceptance Scenarios**:
1. **Given** an admin viewing a volunteer card or edit modal, **When** clicking "Delete Volunteer" and confirming, **Then** `DELETE /api/admin/volunteers/:id` is executed.
2. **Given** a volunteer with associated stays, reviews, shifts, or time-off, **When** deleted, **Then** all related child records are purged in an atomic transaction.
3. **Given** the volunteer list, **When** deletion succeeds, **Then** the UI updates immediately and displays a success notification.

---

### User Story 3 - In-App Stay Record Deletion (Priority: P2)

As an administrator viewing a volunteer's stay history in `StayHistoryModal`, I want to delete an individual duplicate or erroneous stay record without deleting the volunteer profile, so that accidental duplicate stays can be cleanly pruned.

**Why this priority**: A volunteer may have legitimate historical records but an accidental duplicate stay created during import or reactivation. Admins need granular stay removal.

**Independent Test**:
- Open `StayHistoryModal` for a volunteer with 2 stay records.
- Click "Delete Stay" on the duplicate stay.
- Confirm the deletion prompt.
- Verify that specific stay is removed from `StayHistoryModal`.
- Verify the volunteer profile remains intact with their remaining valid stay.

**Acceptance Scenarios**:
1. **Given** a stay record in `StayHistoryModal`, **When** clicking "Delete Stay" and confirming, **Then** `DELETE /api/admin/volunteers/:id/stays/:stayId` is invoked.
2. **Given** deletion of a stay, **When** processed, **Then** only that stay record is deleted and the modal list refreshes immediately.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: `HeadcountService.getDailyHeadcounts` MUST calculate in-house confirmed volunteer occupancy matching the timeline formula:
  $$\text{arrivalDate} \le D \land (\text{noEndDate} \lor \text{departureDate} > D)$$
  for all volunteers whose point-in-time status is Confirmed (`Active`, `Accepted`, or historical on-site stay).
- **FR-002**: `admin-volunteers.ts` MUST expose `DELETE /api/admin/volunteers/:id`.
- **FR-003**: Deleting a volunteer MUST atomically delete all related entries in `volunteer_stays`, `stay_reviews`, `shift_assignments`, and `time_off_requests` to prevent orphaned database records.
- **FR-004**: `admin-volunteers.ts` MUST expose `DELETE /api/admin/volunteers/:id/stays/:stayId` to delete an individual stay record.
- **FR-005**: `VolunteerModal.tsx` and `AdminVolunteersPage.tsx` MUST provide a "Delete Volunteer" button with a confirmation dialogue.
- **FR-006**: `StayHistoryModal.tsx` MUST provide a "Delete Stay" button on each stay record with a confirmation dialogue.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of days on `/admin/headcount` show an in-house volunteer count identical to `/admin/timeline` (0 discrepancies).
- **SC-002**: 0 orphaned records in any related table after deleting a volunteer.
- **SC-003**: Deleting a duplicate stay leaves the parent volunteer and any other stays fully intact.
- **SC-004**: Deletion actions require explicit user confirmation to prevent accidental data loss.
