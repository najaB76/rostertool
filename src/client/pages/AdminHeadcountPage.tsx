import React, { useEffect, useState } from 'react';
import { HeadcountCalendar, HeadcountDay } from '../components/HeadcountCalendar';

type ViewScale = 'month' | 'quarter' | 'year';

export const AdminHeadcountPage: React.FC = () => {
  const [days, setDays] = useState<HeadcountDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewScale, setViewScale] = useState<ViewScale>('month');
  const [isCompact, setIsCompact] = useState(false);
  const [refDate, setRefDate] = useState<Date>(new Date());

  // Compute startDate and endDate based on refDate and viewScale
  const computeDateRange = (date: Date, scale: ViewScale) => {
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-11

    if (scale === 'month') {
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      return {
        start: firstDay.toISOString().split('T')[0],
        end: lastDay.toISOString().split('T')[0],
        title: new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date)
      };
    } else if (scale === 'quarter') {
      const quarterIndex = Math.floor(month / 3); // 0, 1, 2, 3
      const firstDay = new Date(year, quarterIndex * 3, 1);
      const lastDay = new Date(year, (quarterIndex + 1) * 3, 0);
      const qNames = ['Q1 (Jan–Mar)', 'Q2 (Apr–Jun)', 'Q3 (Jul–Sep)', 'Q4 (Oct–Dec)'];
      return {
        start: firstDay.toISOString().split('T')[0],
        end: lastDay.toISOString().split('T')[0],
        title: `${qNames[quarterIndex]} ${year}`
      };
    } else {
      // year
      const firstDay = new Date(year, 0, 1);
      const lastDay = new Date(year, 11, 31);
      return {
        start: firstDay.toISOString().split('T')[0],
        end: lastDay.toISOString().split('T')[0],
        title: `Full Year ${year}`
      };
    }
  };

  const { start: startDate, end: endDate, title: periodTitle } = computeDateRange(refDate, viewScale);

  const fetchHeadcount = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/headcount?startDate=${startDate}&endDate=${endDate}`);
      const data = await res.json();
      setDays(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHeadcount();
  }, [startDate, endDate]);

  const handlePrev = () => {
    const next = new Date(refDate);
    if (viewScale === 'month') {
      next.setMonth(next.getMonth() - 1);
    } else if (viewScale === 'quarter') {
      next.setMonth(next.getMonth() - 3);
    } else {
      next.setFullYear(next.getFullYear() - 1);
    }
    setRefDate(next);
  };

  const handleNext = () => {
    const next = new Date(refDate);
    if (viewScale === 'month') {
      next.setMonth(next.getMonth() + 1);
    } else if (viewScale === 'quarter') {
      next.setMonth(next.getMonth() + 3);
    } else {
      next.setFullYear(next.getFullYear() + 1);
    }
    setRefDate(next);
  };

  const handleToday = () => {
    setRefDate(new Date());
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header with Title and Mode Switchers */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: '0 0 0.25rem 0' }}>Capacity Management (Headcount)</h2>
          <span style={{ fontSize: '0.85rem', color: '#71717a' }}>Monitor daily volunteer occupancy and planned turnover.</span>
        </div>

        {/* View Scale & Heatmap Controls */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', background: '#e4e4e7', borderRadius: '6px', padding: '2px' }}>
            {(['month', 'quarter', 'year'] as ViewScale[]).map(scale => (
              <button
                key={scale}
                onClick={() => setViewScale(scale)}
                style={{
                  padding: '0.4rem 0.85rem',
                  border: 'none',
                  borderRadius: '4px',
                  background: viewScale === scale ? '#fff' : 'transparent',
                  fontWeight: viewScale === scale ? 'bold' : 'normal',
                  color: viewScale === scale ? '#18181b' : '#52525b',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  fontSize: '0.85rem',
                  boxShadow: viewScale === scale ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                {scale}
              </button>
            ))}
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500', color: '#3f3f46' }}>
            <input 
              type="checkbox" 
              checked={isCompact} 
              onChange={(e) => setIsCompact(e.target.checked)} 
            />
            Compact Heatmap (Colors Only)
          </label>
        </div>
      </div>

      {/* Navigation Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '0.75rem 1.25rem', borderRadius: '8px', border: '1px solid #e4e4e7' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button 
            onClick={handlePrev}
            style={{ padding: '0.4rem 0.85rem', background: '#f4f4f5', border: '1px solid #d4d4d8', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' }}
          >
            &larr; Previous
          </button>
          <button 
            onClick={handleToday}
            style={{ padding: '0.4rem 0.85rem', background: '#f4f4f5', border: '1px solid #d4d4d8', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' }}
          >
            Today
          </button>
          <button 
            onClick={handleNext}
            style={{ padding: '0.4rem 0.85rem', background: '#f4f4f5', border: '1px solid #d4d4d8', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' }}
          >
            Next &rarr;
          </button>
        </div>

        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#18181b' }}>
          {periodTitle}
        </div>

        <div style={{ fontSize: '0.85rem', color: '#71717a' }}>
          {startDate} to {endDate}
        </div>
      </div>

      {/* Capacity Indicator Legend Banner */}
      {!isCompact && (
        <div style={{ display: 'flex', gap: '1.5rem', padding: '0.75rem 1.25rem', background: '#fff', borderRadius: '8px', border: '1px solid #e4e4e7', fontSize: '0.85rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <strong>Capacity Benchmarks:</strong>
          <span style={{ color: '#16a34a', fontWeight: '500' }}>• Baseline Target (12 volunteers)</span>
          <span style={{ color: '#ca8a04', fontWeight: '500' }}>• Turnover Overlap (13–15)</span>
          <span style={{ color: '#ea580c', fontWeight: '500' }}>• Low Staffing (10–11)</span>
          <span style={{ color: '#dc2626', fontWeight: '500' }}>• Critical Alert (&lt;10 or &gt;15)</span>
        </div>
      )}

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#71717a' }}>Loading capacity data...</div>
      ) : (
        <HeadcountCalendar 
          days={days} 
          isCompact={isCompact}
          viewScale={viewScale}
        />
      )}
    </div>
  );
};
