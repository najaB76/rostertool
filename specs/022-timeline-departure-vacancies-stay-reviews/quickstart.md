# Quickstart: Timeline Departure Date Integrity, Daily Vacancies Row, and Editable Stay Reviews

**Feature**: `022-timeline-departure-vacancies-stay-reviews`

## Verification Scenarios

### Scenario 1: Departure Date Does Not Become Null on Forward Scroll
1. Open `/admin/timeline` on a date window containing a volunteer who departs on date $D$.
2. Scroll forward past date $D$.
3. Verify the volunteer does not reappear with '????' departure date or indefinite stay bar on future dates.

### Scenario 2: Vacancies Available Row
1. On `/admin/timeline`, locate the row titled "Vacancies (vs Target ${baseline})" directly below "Total CONFIRMED Volunteers".
2. Verify each day displays `Math.max(0, baseline - confirmedVolunteers)`.
3. Verify tooltip shows `${vacancies} vacancies available (Target: ${baseline}, Confirmed: ${count})`.

### Scenario 3: Editing Past Stay Review
1. Open `/admin/volunteers`. Click "Stay History" for a volunteer with a review.
2. Click "Edit Review".
3. Update the rating from 3 to 5 stars, change notes, save.
4. Verify the stay history list and volunteer card reflect the updated 5 stars.
