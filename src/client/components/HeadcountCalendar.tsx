import React from 'react';

export interface HeadcountDay {
  date: string;
  count: number;
  status: 'OPTIMAL' | 'LOW_WARNING' | 'OVERLAP_WARNING' | 'CRITICAL_LOW' | 'CRITICAL_HIGH';
  volunteers?: { id: string; fullName: string; nationality: string }[];
}

interface HeadcountCalendarProps {
  days: HeadcountDay[];
  isCompact?: boolean;
  viewScale?: 'month' | 'quarter' | 'year';
}

export const HeadcountCalendar: React.FC<HeadcountCalendarProps> = ({ 
  days, 
  isCompact = false,
  viewScale = 'month'
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CRITICAL_LOW':
      case 'CRITICAL_HIGH': return '#f87171'; // Red
      case 'LOW_WARNING': return '#fb923c'; // Amber
      case 'OVERLAP_WARNING': return '#facc15'; // Yellow
      case 'OPTIMAL': return '#4ade80'; // Green
      default: return '#e4e4e7';
    }
  };

  const getStatusBorder = (status: string) => {
    switch (status) {
      case 'CRITICAL_LOW':
      case 'CRITICAL_HIGH': return '#dc2626'; 
      case 'LOW_WARNING': return '#ea580c'; 
      case 'OVERLAP_WARNING': return '#ca8a04'; 
      case 'OPTIMAL': return '#16a34a'; 
      default: return '#a1a1aa';
    }
  };

  if (!days || days.length === 0) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#71717a' }}>No headcount data for this period.</div>;
  }

  // --- Compact Heatmap View (Colors only) ---
  if (isCompact) {
    // Group days by month if in year or quarter mode
    const monthsMap = new Map<string, HeadcountDay[]>();
    days.forEach(d => {
      const monthKey = d.date.substring(0, 7); // YYYY-MM
      if (!monthsMap.has(monthKey)) monthsMap.set(monthKey, []);
      monthsMap.get(monthKey)!.push(d);
    });

    const monthEntries = Array.from(monthsMap.entries());

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e4e4e7' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: viewScale === 'year' ? 'repeat(auto-fill, minmax(240px, 1fr))' : viewScale === 'quarter' ? 'repeat(3, 1fr)' : '1fr',
          gap: '1.5rem',
        }}>
          {monthEntries.map(([monthKey, monthDays]) => {
            const monthLabel = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date(`${monthKey}-01T00:00:00`));
            return (
              <div key={monthKey} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#52525b' }}>{monthLabel}</div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: '4px',
                  backgroundColor: '#f8fafc',
                  padding: '8px',
                  borderRadius: '6px'
                }}>
                  {monthDays.map(d => {
                    const dayNum = parseInt(d.date.split('-')[2], 10);
                    return (
                      <div
                        key={d.date}
                        title={`${d.date}: ${d.count} volunteers (${d.status.replace('_', ' ')})\nVolunteers: ${d.volunteers?.map(v => v.fullName).join(', ') || 'None'}`}
                        style={{
                          aspectRatio: '1',
                          backgroundColor: getStatusColor(d.status),
                          borderRadius: '3px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: viewScale === 'year' ? '0' : '0.65rem',
                          color: '#18181b',
                          fontWeight: '500',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}
                      >
                        {viewScale !== 'year' && dayNum}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Heatmap Legend */}
        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: '#52525b', borderTop: '1px solid #f4f4f5', paddingTop: '1rem', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: 14, height: 14, backgroundColor: getStatusColor('OPTIMAL'), borderRadius: 3 }} />
            Optimal (12)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: 14, height: 14, backgroundColor: getStatusColor('OVERLAP_WARNING'), borderRadius: 3 }} />
            Overlap Buffer (13–15)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: 14, height: 14, backgroundColor: getStatusColor('LOW_WARNING'), borderRadius: 3 }} />
            Low Capacity (10–11)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: 14, height: 14, backgroundColor: getStatusColor('CRITICAL_LOW'), borderRadius: 3 }} />
            Critical (&lt;10 or &gt;15)
          </span>
        </div>
      </div>
    );
  }

  // --- Detailed View (Default Month Grid) ---
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.6rem' }}>
      {days.map(d => (
        <div 
          key={d.date} 
          style={{ 
            border: `2px solid ${getStatusBorder(d.status)}`, 
            backgroundColor: getStatusColor(d.status),
            padding: '0.75rem',
            borderRadius: '8px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
          title={d.volunteers?.map(v => v.fullName).join(', ')}
        >
          <div style={{ fontSize: '0.8rem', color: '#3f3f46', fontWeight: 'bold' }}>{d.date}</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#18181b', lineHeight: 1 }}>{d.count}</div>
          <div style={{ fontSize: '0.7rem', fontWeight: '700', color: getStatusBorder(d.status), textTransform: 'uppercase', letterSpacing: '0.025em' }}>
            {d.status.replace('_', ' ')}
          </div>
        </div>
      ))}
    </div>
  );
};
