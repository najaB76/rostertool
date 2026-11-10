# Quickstart & Verification Guide: Staff Management, Admin Auth & Printable Roster

**Feature**: `007-staff-management-auth-and-roster-export`
**Date**: 2026-10-27
**Status**: Completed

## 1. Automated Verification Scenarios

### Scenario A: Admin Authentication (Username & PIN)
1. Open an incognito browser window and navigate to `http://localhost:3000/admin/roster`.
2. Verify you are automatically redirected to `http://localhost:3000/login`.
3. Try entering an invalid PIN (e.g. `9999`) $\to$ observe "Invalid Username or PIN" error.
4. Enter Username: `admin` and PIN: `1234` $\to$ submit.
5. Verify you are redirected back to `/admin/roster` and the management navigation appears with a "Logout" button.
6. Click "Logout" $\to$ verify session is cleared and returned to `/login`.
7. Verify volunteer portal `http://localhost:3000/portal?token=...` works without requiring login credentials.

### Scenario B: Staff Management & Nationality Flags
1. Log in as admin and navigate to `/admin/staff`.
2. Click **"+ Add Staff Member"**:
   - Full Name: `Hervé Blanc`.
   - Country: Select `France (FR)` with vector flag 🇫🇷.
   - Role: `Receptionist`.
   - Submit.
3. Observe Hervé in the staff table with his French flag 🇫🇷.
4. Click **"Edit"** on Hervé:
   - Change Role to `Senior Receptionist`.
   - Save $\to$ verify updated immediately.
5. Click **"Delete"** on a test staff member $\to$ confirm $\to$ verify removed from list.

### Scenario C: WhatsApp Portrait Roster View
1. Navigate to `/admin/roster`.
2. Click **"📱 WhatsApp / Screenshot View"**.
3. Inspect the rendered roster table:
   - Verify layout is portrait, clean, high-contrast, matching `WhatsApp Image 2026-10-25 at 16.01.45.jpeg`.
   - Orange header: `Reception` / `8am – 4pm`.
   - Blue header: `Night Shift` / `4pm – 12am`.
   - Gray header: `Housekeeping` / `10am – 2pm`.
   - 7 rows for Monday to Sunday.
   - Day Receptionist name and flag.
   - Night Receptionist name and flag.
   - Housekeeping grid showing all assigned housekeepers with first name and vector flags.
4. Click **"🖨️ Print / Save PDF"** $\to$ observe browser print dialog opens with portrait styling.
