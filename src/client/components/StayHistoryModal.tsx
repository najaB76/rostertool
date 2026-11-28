import React, { useEffect, useState } from 'react';
import { useDateFormat } from '../context/DateFormatContext';

interface StayHistoryModalProps {
  isOpen: boolean;
  volunteer: any;
  onClose: () => void;
  onStayUpdated?: () => void;
}

export const StayHistoryModal: React.FC<StayHistoryModalProps> = ({
  isOpen,
  volunteer,
  onClose,
  onStayUpdated
}) => {
  const { formatDate } = useDateFormat();
  const [stays, setStays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Editing state for reviews
  const [editingStayId, setEditingStayId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState<number>(5);
  const [editNotes, setEditNotes] = useState<string>('');
  const [editRehire, setEditRehire] = useState<string>('Accept');
  const [saving, setSaving] = useState(false);

  const fetchStays = () => {
    if (!volunteer?.id) return;
    setLoading(true);
    fetch(`/api/admin/volunteers/${volunteer.id}/stays`)
      .then(res => res.json())
      .then(data => {
        setStays(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isOpen && volunteer?.id) {
      setEditingStayId(null);
      fetchStays();
    }
  }, [isOpen, volunteer?.id]);

  if (!isOpen || !volunteer) return null;

  const handleStartEdit = (stay: any) => {
    setEditingStayId(stay.id);
    setEditRating(stay.departureRating || 5);
    setEditNotes(stay.departureNotes || '');
    setEditRehire(stay.rehireStatus || 'Accept');
  };

  const handleCancelEdit = () => {
    setEditingStayId(null);
  };

  const handleSaveReview = async (stayId: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/volunteers/${volunteer.id}/stays/${stayId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          departureRating: editRating,
          departureNotes: editNotes,
          rehireStatus: editRehire
        })
      });

      if (res.ok) {
        const updated = await res.json();
        setStays(prev => prev.map(s => s.id === stayId ? { ...s, ...updated } : s));
        setEditingStayId(null);
        if (onStayUpdated) onStayUpdated();
      }
    } catch (e) {
      console.error('Failed to update stay review:', e);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStay = async (stayId: string) => {
    if (!window.confirm('Are you sure you want to delete this stay record?')) return;
    try {
      const res = await fetch(`/api/admin/volunteers/${volunteer.id}/stays/${stayId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setStays(prev => prev.filter(s => s.id !== stayId));
        if (onStayUpdated) onStayUpdated();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(`Failed to delete stay: ${data.error || res.statusText}`);
      }
    } catch (e: any) {
      alert(`Error deleting stay: ${e.message}`);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100 }}>
      <div style={{ background: '#fff', padding: '1.75rem', borderRadius: '8px', width: '580px', maxWidth: '90vw', maxHeight: '85vh', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e4e4e7', paddingBottom: '0.75rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a' }}>
              Stay History: {volunteer.preferredName || volunteer.fullName}
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Recorded stays and departure reviews ({stays.length} total)</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading stay records...</div>
        ) : stays.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No recorded stays found.</div>
        ) : (
          <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.85rem', paddingRight: '0.25rem' }}>
            {stays.map((stay, idx) => {
              const isEditing = editingStayId === stay.id;
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
                    gap: '0.5rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: '600', fontSize: '0.9rem', color: '#1e293b' }}>
                      Stay #{stays.length - idx} {idx === 0 && <span style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: 'normal' }}>(Most Recent)</span>}
                    </div>

                    {!isEditing && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {stars && (
                          <span style={{ color: '#f59e0b', fontSize: '1rem', letterSpacing: '0.05em' }}>
                            {stars}
                          </span>
                        )}
                        <button
                          onClick={() => handleStartEdit(stay)}
                          style={{
                            background: 'none',
                            border: '1px solid #cbd5e1',
                            borderRadius: '4px',
                            padding: '0.15rem 0.45rem',
                            fontSize: '0.75rem',
                            color: '#2563eb',
                            cursor: 'pointer',
                            fontWeight: '500'
                          }}
                          title="Edit rating, review notes, and rehire recommendation"
                        >
                          ✎ Edit Review
                        </button>
                        <button
                          onClick={() => handleDeleteStay(stay.id)}
                          style={{
                            background: 'none',
                            border: '1px solid #fecaca',
                            borderRadius: '4px',
                            padding: '0.15rem 0.45rem',
                            fontSize: '0.75rem',
                            color: '#991b1b',
                            cursor: 'pointer',
                            fontWeight: '500'
                          }}
                          title="Delete duplicate or erroneous stay record"
                        >
                          🗑 Delete Stay
                        </button>
                      </div>
                    )}
                  </div>

                  <div style={{ fontSize: '0.85rem', color: '#475569' }}>
                    📅 <strong>Dates:</strong> {formatDate(stay.arrivalDate)} → {stay.noEndDate ? 'No end date' : (formatDate(stay.departureDate) || 'Present')}
                  </div>

                  {/* Inline Review Edit Form */}
                  {isEditing ? (
                    <div style={{ backgroundColor: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#334155' }}>Departure Rating:</span>
                        <div style={{ display: 'flex', gap: '0.25rem', fontSize: '1.25rem', cursor: 'pointer' }}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              onClick={() => setEditRating(star)}
                              style={{ color: star <= editRating ? '#f59e0b' : '#cbd5e1' }}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#334155' }}>Rehire Recommendation:</label>
                        <select
                          value={editRehire}
                          onChange={(e) => setEditRehire(e.target.value)}
                          style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                        >
                          <option value="Accept">Accept</option>
                          <option value="Possible">Possible</option>
                          <option value="Do Not Accept">Do Not Accept</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '0.25rem' }}>Review Notes:</label>
                        <textarea
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          rows={2}
                          placeholder="Optional feedback about this volunteer's stay..."
                          style={{ width: '100%', boxSizing: 'border-box', padding: '0.4rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                        />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.25rem' }}>
                        <button
                          type="button"
                          className="btn-cancel"
                          onClick={handleCancelEdit}
                          disabled={saving}
                          style={{ padding: '0.3rem 0.75rem', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer' }}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="btn-primary"
                          onClick={() => handleSaveReview(stay.id)}
                          disabled={saving}
                          style={{ padding: '0.3rem 0.85rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                          {saving ? 'Saving...' : 'Save Review'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {isRehire && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.1rem' }}>
                          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Rehire:</span>
                          <span className={`rehire-pill rehire-pill-${isRehire === 'Accept' ? 'accept' : isRehire === 'Possible' ? 'possible' : 'no'}`}>
                            {isRehire}
                          </span>
                        </div>
                      )}

                      {stay.departureNotes && (
                        <div style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic', marginTop: '0.2rem', backgroundColor: '#fff', padding: '0.4rem 0.6rem', borderRadius: '4px', border: '1px solid #f1f5f9' }}>
                          "{stay.departureNotes}"
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #e4e4e7', paddingTop: '0.75rem' }}>
          <button
            type="button"
            className="btn-primary"
            onClick={onClose}
            style={{ padding: '0.45rem 1.25rem', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
