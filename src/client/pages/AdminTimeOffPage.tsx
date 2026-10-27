import React, { useEffect, useState } from 'react';
import { CountryFlag } from '../components/CountryFlag';
import { formatDate } from '../utils/date-utils';

export const AdminTimeOffPage: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [filter, setFilter] = useState('Pending');
  const [loading, setLoading] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/time-off?status=${filter}`);
      const data = await res.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const handleReview = async (id: string, status: 'Approved' | 'Denied') => {
    try {
      await fetch(`/api/admin/time-off/${id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      fetchRequests();
    } catch (e) {
      console.error(e);
      alert('Failed to update request');
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'Approved':
        return { bg: '#dcfce7', color: '#166534', border: '#bbf7d0' };
      case 'Denied':
        return { bg: '#fee2e2', color: '#991b1b', border: '#fecaca' };
      case 'Cancelled':
        return { bg: '#f1f5f9', color: '#64748b', border: '#e2e8f0' };
      default:
        // Pending
        return { bg: '#fef3c7', color: '#92400e', border: '#fde68a' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ margin: '0 0 0.25rem 0' }}>Time-Off Requests</h2>
        <span style={{ fontSize: '0.85rem', color: '#71717a' }}>Review and manage volunteer leave requests and holiday approvals.</span>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', borderBottom: '2px solid #e4e4e7', paddingBottom: '0.5rem' }}>
        {['Pending', 'Approved', 'Denied', 'Cancelled', 'All'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              background: 'none',
              border: 'none',
              fontWeight: filter === s ? 'bold' : 'normal',
              color: filter === s ? '#3b82f6' : '#52525b',
              borderBottom: filter === s ? '2px solid #3b82f6' : 'none',
              marginBottom: '-0.6rem',
              paddingBottom: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.95rem'
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#71717a' }}>Loading requests...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {requests.map(req => {
            const badge = getStatusBadgeStyle(req.status);
            return (
              <div
                key={req.id}
                style={{
                  background: '#fff',
                  padding: '1.25rem',
                  borderRadius: '8px',
                  border: '1px solid #e4e4e7',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '1rem', color: '#1e293b' }}>
                      {req.volunteerName || 'Unknown Volunteer'}
                    </span>
                    <CountryFlag countryCode={req.volunteerNationality} />
                    <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.4rem', borderRadius: '4px', backgroundColor: '#f1f5f9', color: '#475569' }}>
                      {req.volunteerRole || 'Volunteer'}
                    </span>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                        backgroundColor: badge.bg,
                        color: badge.color,
                        border: `1px solid ${badge.border}`
                      }}
                    >
                      {req.status}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.9rem', color: '#334155', fontWeight: '500' }}>
                    📅 Requested Date: <strong>{formatDate(req.date)}</strong>
                  </div>

                  {req.reason && (
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                      <em>"{req.reason}"</em>
                    </div>
                  )}

                  {req.createdAt && (
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      Submitted: {formatDate(req.createdAt)}
                    </div>
                  )}
                </div>

                {/* Management Action Buttons */}
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {req.status === 'Pending' && (
                    <>
                      <button
                        onClick={() => handleReview(req.id, 'Approved')}
                        style={{
                          padding: '0.45rem 1rem',
                          background: '#10b981',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '0.85rem'
                        }}
                      >
                        ✓ Approve
                      </button>
                      <button
                        onClick={() => handleReview(req.id, 'Denied')}
                        style={{
                          padding: '0.45rem 1rem',
                          background: '#fee2e2',
                          color: '#991b1b',
                          border: '1px solid #fecaca',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '0.85rem'
                        }}
                      >
                        ✕ Decline
                      </button>
                    </>
                  )}

                  {req.status === 'Approved' && (
                    <button
                      onClick={() => handleReview(req.id, 'Denied')}
                      style={{
                        padding: '0.35rem 0.75rem',
                        background: '#fff',
                        color: '#dc2626',
                        border: '1px solid #fca5a5',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }}
                    >
                      Revoke / Decline
                    </button>
                  )}

                  {req.status === 'Denied' && (
                    <button
                      onClick={() => handleReview(req.id, 'Approved')}
                      style={{
                        padding: '0.35rem 0.75rem',
                        background: '#fff',
                        color: '#16a34a',
                        border: '1px solid #86efac',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }}
                    >
                      Re-approve
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {requests.length === 0 && (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8', background: '#fff', borderRadius: '8px', border: '1px solid #e4e4e7' }}>
              No time-off requests found in "{filter}" status.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
