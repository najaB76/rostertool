import React, { useEffect, useState } from 'react';
import { HeadcountCalendar } from '../components/HeadcountCalendar.js';

export const AdminHeadcountPage: React.FC = () => {
  const [days, setDays] = useState<any[]>([]);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 28);
    return d.toISOString().split('T')[0];
  });

  const fetchHeadcount = async () => {
    try {
      const res = await fetch(`/api/admin/headcount?startDate=${startDate}&endDate=${endDate}`);
      const data = await res.json();
      setDays(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchHeadcount();
  }, [startDate, endDate]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Capacity Management (Headcount)</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <label style={{ fontSize: '0.9rem' }}>
            Start: <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </label>
          <label style={{ fontSize: '0.9rem' }}>
            End: <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </label>
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '1rem', padding: '1rem', background: '#fff', borderRadius: '8px', border: '1px solid #e4e4e7', fontSize: '0.85rem' }}>
        <strong>Target Baseline:</strong> 12 Volunteers
        <span style={{ color: '#f97316' }}>• Low (10-11)</span>
        <span style={{ color: '#eab308' }}>• Overlap (13-15)</span>
        <span style={{ color: '#ef4444' }}>• Critical (&lt;10 or &gt;15)</span>
      </div>

      <HeadcountCalendar days={days} />
    </div>
  );
};
