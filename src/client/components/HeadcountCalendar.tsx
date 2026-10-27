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

// Computes Monday-first weekday index: 0 = Mon, 1 = Tue, 2 = Wed, 3 = Thu, 4 = Fri, 5 = Sat, 6 = Sun
export function getMondayFirstWeekday(dateStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const jsDay = date.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  return (jsDay + 6) % 7;
}

const WEEKDAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const WEEKDAY_SHORT = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

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

  // --- Compact Heatmap View (Colors only, Monday-aligned) ---
  if (isCompact) {
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
            const [y, m] = monthKey.split('-').map(Number);
            const monthLabel = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date(y, m - 1, 1));
            const leadOffset = getMondayFirstWeekday(monthDays[0].date);
            const totalCells = leadOffset + monthDays.length;
            const remainder = totalCells % 7;
            const trailOffset = remainder === 0 ? 0 : 7 - remainder;

            return (
              <div key={monthKey} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#334155' }}>{monthLabel}</div>
                
                {/* Weekday indicator headers */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', fontSize: '0.65rem', color: '#94a3b8', fontWeight: '600' }}>
                  {WEEKDAY_SHORT.map((w, idx) => (
                    <span key={idx}>{w}</span>
                  ))}
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: '4px',
                  backgroundColor: '#f8fafc',
                  padding: '6px',
                  borderRadius: '6px'
                }}>
                  {/* Leading offset cells for Monday-first alignment */}
                  {Array.from({ length: leadOffset }).map((_, i) => (
                    <div key={`lead-${i}`} style={{ aspectRatio: '1', opacity: 0 }} />
                  ))}

                  {/* Day cells */}
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

                  {/* Trailing padding cells */}
                  {Array.from({ length: trailOffset }).map((_, i) => (
                    <div key={`trail-${i}`} style={{ aspectRatio: '1', opacity: 0 }} />
                  ))}
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

  // --- Detailed View (Monday to Sunday Columns) ---
  const leadOffset = getMondayFirstWeekday(days[0].date);
  const totalCells = leadOffset + days.length;
  const remainder = totalCells % 7;
  const trailOffset = remainder === 0 ? 0 : 7 - remainder;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {/* Monday-to-Sunday Weekday Header Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.6rem', textAlign: 'center', fontWeight: 'bold', fontSize: '0.9rem', color: '#475569' }}>
        {WEEKDAY_NAMES.map((name, idx) => (
          <div key={idx} style={{ padding: '0.5rem', backgroundColor: '#e2e8f0', borderRadius: '6px' }}>
            {name}
          </div>
        ))}
      </div>

      {/* Calendar Grid with Leading and Trailing Offsets */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.6rem' }}>
        {/* Leading offset cells */}
        {Array.from({ length: leadOffset }).map((_, i) => (
          <div 
            key={`lead-${i}`} 
            style={{ 
              border: '1px dashed #e2e8f0', 
              borderRadius: '8px', 
              backgroundColor: '#f8fafc',
              minHeight: '80px',
              opacity: 0.5
            }} 
          />
        ))}

        {/* Real day cells */}
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
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              minHeight: '80px',
              justifyContent: 'center'
            }}
            title={d.volunteers?.map(v => v.fullName).join(', ')}
          >
            <div style={{ fontSize: '0.8rem', color: '#1e293b', fontWeight: 'bold' }}>{d.date}</div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a', lineHeight: 1 }}>{d.count}</div>
            <div style={{ fontSize: '0.7rem', fontWeight: '700', color: getStatusBorder(d.status), textTransform: 'uppercase', letterSpacing: '0.025em' }}>
              {d.status.replace('_', ' ')}
            </div>
          </div>
        ))}

        {/* Trailing offset cells */}
        {Array.from({ length: trailOffset }).map((_, i) => (
          <div 
            key={`trail-${i}`} 
            style={{ 
              border: '1px dashed #e2e8f0', 
              borderRadius: '8px', 
              backgroundColor: '#f8fafc',
              minHeight: '80px',
              opacity: 0.5
            }} 
          />
        ))}
      </div>
    </div>
  );
};
