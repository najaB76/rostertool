import React, { useState } from 'react';

interface DepartureModalProps {
  isOpen: boolean;
  volunteer: any;
  onClose: () => void;
  onSubmit: (data: { departureRating: number; departureNotes: string; rehireStatus: string }) => Promise<void>;
}

export const DepartureModal: React.FC<DepartureModalProps> = ({
  isOpen,
  volunteer,
  onClose,
  onSubmit
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [rehireStatus, setRehireStatus] = useState<string>('Accept');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !volunteer) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        departureRating: rating,
        departureNotes: notes,
        rehireStatus
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
            Complete Departure: {volunteer.preferredName || volunteer.fullName}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Star Rating Picker */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#334155', marginBottom: '0.35rem' }}>
              Exit Rating (1 to 5 Stars) *
            </label>
            <div style={{ display: 'flex', gap: '0.4rem', fontSize: '1.75rem', cursor: 'pointer' }}>
              {[1, 2, 3, 4, 5].map((star) => {
                const filled = (hoverRating !== null ? hoverRating >= star : rating >= star);
                return (
                  <span
                    key={star}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    onClick={() => setRating(star)}
                    style={{ color: filled ? '#f59e0b' : '#cbd5e1', transition: 'color 0.1s' }}
                    title={`${star} Star${star > 1 ? 's' : ''}`}
                  >
                    ★
                  </span>
                );
              })}
              <span style={{ fontSize: '0.9rem', color: '#64748b', alignSelf: 'center', marginLeft: '0.5rem' }}>
                ({rating} / 5)
              </span>
            </div>
          </div>

          {/* Rehire Recommendation Dropdown */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#334155', marginBottom: '0.35rem' }}>
              Future Rehire Recommendation *
            </label>
            <select
              value={rehireStatus}
              onChange={(e) => setRehireStatus(e.target.value)}
              style={{ width: '100%', padding: '0.55rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.9rem', backgroundColor: '#fff' }}
              required
            >
              <option value="Accept">Accept (Welcome back anytime)</option>
              <option value="Possible">Possible (Conditional / Neutral)</option>
              <option value="Don't Accept">Don't Accept (Do not re-hire)</option>
            </select>
          </div>

          {/* Qualitative Notes */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#334155', marginBottom: '0.35rem' }}>
              Departure Review Comments & Feedback
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Summary of volunteer performance, attendance, reliability, attitude, or farewell comments..."
              style={{ width: '100%', minHeight: '90px', padding: '0.55rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.9rem', fontFamily: 'inherit', boxSizing: 'border-box' }}
            />
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
              style={{ padding: '0.5rem 1.25rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: submitting ? 'not-allowed' : 'pointer', fontWeight: '600' }}
            >
              {submitting ? 'Saving...' : 'Confirm Departure'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
