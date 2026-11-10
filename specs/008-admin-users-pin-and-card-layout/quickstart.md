# Quickstart & Verification Guide: Admin Users, PIN Change & Card Layout

**Feature**: `008-admin-users-pin-and-card-layout`
**Date**: 2026-10-27
**Status**: Completed

## 1. Automated Verification Scenarios

### Scenario A: Multi-Admin User Management
1. Log in with `admin` / `1234`.
2. Navigate to `/admin/users` via the "Admin Users" link in the header.
3. Verify `admin` is listed.
4. Click **"+ Add Admin User"**:
   - Username: `manager_john`
   - Initial PIN: `9876`
   - Submit.
5. Verify `manager_john` appears in the table.
6. Log out $\to$ log in as `manager_john` with PIN `9876` $\to$ verify successful login.
7. Attempt deleting `manager_john` while logged in as `manager_john` $\to$ verify self-deletion error.
8. Log in as `admin`, edit `manager_john` $\to$ update PIN to `5555`.
9. Delete `manager_john` $\to$ verify removed from list.

### Scenario B: Self-Service PIN Change
1. Log in as `admin`.
2. In the header bar, click **"Change PIN"**:
   - Enter Current PIN: `1234`
   - Enter New PIN: `4321`
   - Confirm New PIN: `4321`
   - Submit $\to$ verify success toast.
3. Log out $\to$ attempt login with `1234` $\to$ verify rejected.
4. Log in with `4321` $\to$ verify accepted.

### Scenario C: Two-Line Volunteer Card Layout
1. Navigate to `/admin/volunteers`.
2. Inspect cards across tabs:
   - Line 1 displays: `Role: [role]  •  Source: [source]  •  Stay Dates: [arrival] → [departure]` and qualification badges.
   - Line 2 displays: `✉️ [email]` and `📞 [phone]` with active links.
   - Confirm clean vertical separation and consistent alignment across all cards.

### Scenario D: Staff Roles (Assistant Manager)
1. Navigate to `/admin/staff`.
2. Click **"+ Add Staff Member"**:
   - Verify the Role selector dropdown contains **"Assistant Manager"**.
   - Verify **"Shift Supervisor"** is NOT in the list.
