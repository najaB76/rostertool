# Quickstart: Fix Stay History Modal ReferenceError

**Feature**: `023-fix-stay-history-reference-error`

## Verification Scenarios

### Scenario 1: Open Stay History Modal
1. Open `/admin/volunteers`.
2. Click the "Stays" link on any volunteer card.
3. Verify the modal opens immediately without blanking the page or throwing `ReferenceError`.
4. Click "Edit Review" $\rightarrow$ modify rating/notes $\rightarrow$ click "Save Review".
5. Verify changes persist and volunteer list reloads cleanly.
