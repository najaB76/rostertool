import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TimeOffModal } from '../components/TimeOffModal.js';
import { CountryFlag } from '../components/CountryFlag.js';

export const VolunteerPortalPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTimeOffModalOpen, setIsTimeOffModalOpen] = useState(false);

  const fetchPortalData = async () => {
    if (!token) {
      setError('No magic link token provided.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/portal/me?token=${token}`);
      if (!res.ok) {
        throw new Error('Invalid or expired token.');
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPortalData();
  }, [token]);

  const handleTimeOffSubmit = async (date: string, reason: string) => {
    try {
      await fetch(`/api/portal/time-off?token=${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, reason })
      });
      setIsTimeOffModalOpen(false);
      fetchPortalData();
    } catch (e) {
      console.error(e);
      alert('Failed to submit request');
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading your portal...</div>;
  if (error) return <div style={{ padding: '2rem', color: '#ef4444', textAlign: 'center' }}>{error}</div>;
  if (!data) return null;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header style={{ textAlign: 'center', paddingBottom: '1rem', borderBottom: '1px solid #e4e4e7' }}>
        <h1 style={{ fontSize: '1.5rem', margin: '0 0 0.5rem 0' }}>Hostel Portal</h1>
        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
          Welcome, {data.volunteer.fullName} <CountryFlag countryCode={data.volunteer.nationality} />
        </div>
      </header>

      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>My Upcoming Shifts</h2>
          <button 
            onClick={() => setIsTimeOffModalOpen(true)}
            style={{ padding: '0.5rem 1rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
          >
            Request Time Off
          </button>
        </div>
        
        {data.myUpcomingShifts?.length === 0 ? (
          <div style={{ padding: '1rem', background: '#fff', borderRadius: '8px', border: '1px solid #e4e4e7', color: '#71717a', textAlign: 'center' }}>
            No upcoming shifts scheduled.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {data.myUpcomingShifts.map((shift: any) => (
              <div key={shift.id} style={{ padding: '1rem', background: '#fff', borderRadius: '8px', border: '1px solid #e4e4e7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#18181b' }}>{shift.date}</div>
                  <div style={{ color: '#52525b', fontSize: '0.9rem' }}>{shift.shiftName}</div>
                </div>
                <div style={{ fontWeight: 'bold', color: '#3b82f6' }}>
                  {shift.startTime} - {shift.endTime}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {data.myTimeOffRequests?.length > 0 && (
        <section>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>My Time Off Requests</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {data.myTimeOffRequests.map((req: any) => (
              <div key={req.id} style={{ padding: '1rem', background: '#fff', borderRadius: '8px', border: '1px solid #e4e4e7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#18181b' }}>{req.date}</div>
                  <div style={{ color: '#71717a', fontSize: '0.85rem' }}>{req.reason || 'No reason provided'}</div>
                </div>
                <div style={{ 
                  fontWeight: 'bold', 
                  fontSize: '0.85rem',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  backgroundColor: req.status === 'Approved' ? '#bbf7d0' : req.status === 'Denied' ? '#fecaca' : '#fef08a',
                  color: req.status === 'Approved' ? '#166534' : req.status === 'Denied' ? '#991b1b' : '#854d0e'
                }}>
                  {req.status}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {isTimeOffModalOpen && (
        <TimeOffModal 
          onSubmit={handleTimeOffSubmit} 
          onClose={() => setIsTimeOffModalOpen(false)} 
        />
      )}
    </div>
  );
};
