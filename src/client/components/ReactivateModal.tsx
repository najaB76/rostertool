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
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100 }}>
      <div style={{ background: '#fff', padding: '1.75rem', borderRadius: '8px', width: '480px', maxWidth: '90vw', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e4e4e7', paddingBottom: '0.75rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a' }}>
            Re-Activate Volunteer: {volunteer.preferredName || volunteer.fullName}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#334155', marginBottom: '0.35rem' }}>
              New Arrival Date *
            </label>
            <input
              type="date"
              value={arrivalDate}
              onChange={(e) => setArrivalDate(e.target.value)}
              style={{ width: '100%', padding: '0.55rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }}
              required
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#334155' }}>
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
              style={{ width: '100%', padding: '0.55rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.9rem', backgroundColor: noEndDate ? '#f1f5f9' : '#fff', cursor: noEndDate ? 'not-allowed' : 'text', boxSizing: 'border-box' }}
              required={!noEndDate}
            />
          </div>

          <div style={{ padding: '0.75rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', fontSize: '0.85rem', color: '#166534' }}>
            ℹ️ Re-activating will create a new stay record and move this volunteer back to <strong>Active</strong>. Past stay ratings and notes will be preserved in their history.
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              style={{ padding: '0.5rem 1rem', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{ padding: '0.5rem 1.25rem', background: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', cursor: submitting ? 'not-allowed' : 'pointer', fontWeight: '600' }}
            >
              {submitting ? 'Re-activating...' : 'Re-Activate for New Stay'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
