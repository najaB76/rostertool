import React, { useState } from 'react';

interface ReactivateModalProps {
  isOpen: boolean;
  volunteer: any;
  onClose: () => void;
  onSubmit: (data: { arrivalDate: string; departureDate?: string | null; noEndDate?: boolean }) => Promise<void>;
}

export const ReactivateModal: React.FC<ReactivateModalProps> = ({
  isOpen,
  volunteer,
  onClose,
  onSubmit
}) => {
  const [arrivalDate, setArrivalDate] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [noEndDate, setNoEndDate] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !volunteer) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!arrivalDate) return;
    if (!noEndDate && !departureDate) {
      alert('Please enter a departure date or check "No end date".');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        arrivalDate,
        departureDate: noEndDate ? null : departureDate,
        noEndDate
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      <div className="modal-card" style={{ width: '480px', maxWidth: '90vw' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
          <h3 className="modal-title" style={{ margin: 0, border: 'none', padding: 0 }}>
            Re-Activate Volunteer: {volunteer.preferredName || volunteer.fullName}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="form-label" style={{ marginBottom: '0.35rem' }}>
              New Arrival Date *
            </label>
            <input
              type="date"
              value={arrivalDate}
              onChange={(e) => setArrivalDate(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label className="form-label">
                New Departure Date
              </label>
              <label style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={noEndDate}
                  onChange={(e) => setNoEndDate(e.target.checked)}
                />
                No end date (Open-ended stay)
              </label>
            </div>
            <input
              type="date"
              value={departureDate}
              disabled={noEndDate}
              onChange={(e) => setDepartureDate(e.target.value)}
              className="form-input"
              style={{ cursor: noEndDate ? 'not-allowed' : 'text' }}
              required={!noEndDate}
            />
          </div>

          <div style={{ padding: '0.75rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', fontSize: '0.85rem', color: '#166534' }}>
            ℹ️ Re-activating will create a new stay record and move this volunteer back to <strong>Active</strong>. Past stay ratings and notes will be preserved in their history.
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={submitting}
              style={{ padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
              style={{ padding: '0.5rem 1.25rem', borderRadius: '4px', cursor: submitting ? 'not-allowed' : 'pointer', fontWeight: '600' }}
            >
              {submitting ? 'Re-activating...' : 'Confirm Re-activation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
