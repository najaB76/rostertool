import React, { useEffect, useState } from 'react';
import { formatDate } from '../utils/date-utils';

interface StayHistoryModalProps {
  isOpen: boolean;
  volunteer: any;
  onClose: () => void;
}

export const StayHistoryModal: React.FC<StayHistoryModalProps> = ({
  isOpen,
  volunteer,
  onClose
}) => {
  const [stays, setStays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && volunteer?.id) {
      setLoading(true);
      fetch(`/api/admin/volunteers/${volunteer.id}/stays`)
        .then(res => res.json())
        .then(data => {
          setStays(Array.isArray(data) ? data : []);
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, volunteer?.id]);

  if (!isOpen || !volunteer) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100 }}>
      <div style={{ background: '#fff', padding: '1.75rem', borderRadius: '8px', width: '560px', maxWidth: '90vw', maxHeight: '80vh', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e4e4e7', paddingBottom: '0.75rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a' }}>
              Stay History: {volunteer.preferredName || volunteer.fullName}
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Recorded stays and exit reviews ({stays.length} total)</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading stay records...</div>
        ) : stays.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No recorded stays found.</div>
        ) : (
          <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingRight: '0.25rem' }}>
            {stays.map((stay, idx) => {
              const stars = stay.departureRating ? '★'.repeat(stay.departureRating) + '☆'.repeat(5 - stay.departureRating) : null;
              const isRehire = stay.rehireStatus;

              let rehireBg = '#f1f5f9';
              let rehireColor = '#475569';
              if (isRehire === 'Accept') {
                rehireBg = '#dcfce7';
                rehireColor = '#166534';
              } else if (isRehire === 'Possible') {
                rehireBg = '#fef9c3';
                rehireColor = '#854d0e';
              } else if (isRehire === "Don't Accept" || isRehire === 'NO' || isRehire === 'Do Not Accept') {
                rehireBg = '#fee2e2';
                rehireColor = '#991b1b';
              }

              return (
                <div
                  key={stay.id || idx}
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: idx === 0 ? '#f8fafc' : '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: '600', fontSize: '0.9rem', color: '#1e293b' }}>
                      Stay #{stays.length - idx} {idx === 0 && <span style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: 'normal' }}>(Most Recent)</span>}
                    </div>
                    {stars && (
                      <span style={{ color: '#f59e0b', fontSize: '1rem', letterSpacing: '0.05em' }}>
                        {stars}
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: '0.85rem', color: '#475569' }}>
                    📅 <strong>Dates:</strong> {formatDate(stay.arrivalDate)} → {stay.noEndDate ? 'No end date' : (formatDate(stay.departureDate) || 'Present')}
                  </div>

                  {isRehire && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.1rem' }}>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Rehire:</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 'bold', padding: '0.15rem 0.5rem', borderRadius: '4px', backgroundColor: rehireBg, color: rehireColor }}>
                        {isRehire}
                      </span>
                    </div>
                  )}

                  {stay.departureNotes && (
                    <div style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic', marginTop: '0.2rem', backgroundColor: '#fff', padding: '0.4rem 0.6rem', borderRadius: '4px', border: '1px solid #f1f5f9' }}>
                      "{stay.departureNotes}"
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #e4e4e7', paddingTop: '0.75rem' }}>
          <button
            onClick={onClose}
            style={{ padding: '0.45rem 1.25rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
