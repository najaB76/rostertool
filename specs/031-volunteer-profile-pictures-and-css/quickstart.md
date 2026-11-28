# Quickstart: Volunteer Profile Pictures and CSS Style Decoupling

**Feature**: `031-volunteer-profile-pictures-and-css`

## Verification Scenarios

### Scenario 1: Upload and View Profile Picture
1. Open `/admin/volunteers`.
2. Click "+ Add Volunteer" or edit an existing volunteer.
3. In `VolunteerModal`, click the photo placeholder icon and choose an image.
4. Verify the thumbnail preview appears next to the preferred name.
5. Save the volunteer.
6. Verify the volunteer card in `/admin/volunteers` displays the profile picture thumbnail next to the preferred name.

### Scenario 2: Lightbox Modal Overlay
1. Click the profile picture thumbnail on the volunteer card or inside `VolunteerModal`.
2. Verify the full-sized image opens in a centered modal overlay with a dimmed backdrop.
3. Press `Escape` on the keyboard $\rightarrow$ verify the modal closes immediately.
4. Click the thumbnail again to open the overlay $\rightarrow$ click the `✕` close button $\rightarrow$ verify the modal closes.
5. Click outside the image area on the backdrop $\rightarrow$ verify the modal closes.

### Scenario 3: Update and Remove Photo
1. Edit the volunteer in `VolunteerModal`.
2. Click the upload button to replace the image with another image.
3. Verify the new image displays.
4. Click the "Remove Photo" button $\rightarrow$ verify the photo is removed and reverts to placeholder.
5. Save the volunteer $\rightarrow$ verify the volunteer card no longer displays the thumbnail.

### Scenario 4: Dark & Light Mode Theme Consistency
1. Toggle dark mode.
2. Verify the thumbnail, upload controls, and lightbox modal adapt cleanly with dark surfaces and high-contrast text.
3. Verify form inputs and dialog cards derive styling from CSS classes without inline style conflicts.
