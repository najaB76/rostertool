import React, { useEffect, useState } from 'react';
import { CountryFlag } from '../components/CountryFlag';
import { snapToMonday, addDays, formatDate } from '../utils/date-utils';

const COLOR_PALETTE = [
  '#f97316', // Orange
  '#3b82f6', // Blue
  '#1e40af', // Dark blue
  '#ca8a04', // Yellow / Amber
  '#0f172a', // Slate / Black
  '#7c3aed', // Purple
  '#db2777', // Pink
  '#0d9488', // Teal
  '#dc2626', // Red
  '#16a34a', // Green
  '#4f46e5', // Indigo
  '#c026d3', // Fuchsia
  '#65a30d', // Lime
  '#0891b2', // Cyan
  '#b45309'  // Brown / Bronze
];

function getBarColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  return COLOR_PALETTE[Math.abs(hash) % COLOR_PALETTE.length];
}

export const AdminTimelinePage: React.FC = () => {
  const [startDate, setStartDate] = useState(snapToMonday(new Date()));
  const [weeks, setWeeks] = useState(5);
  const [timelineData, setTimelineData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchTimeline = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/timeline?startDate=${startDate}&weeks=${weeks}`);
      const data = await res.json();
      setTimelineData(data);
    } catch (err) {
      console.error('Failed to fetch timeline:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeline();
  }, [startDate, weeks]);

  const handlePrevWeeks = () => setStartDate(prev => addDays(prev, -7 * weeks));
  const handleNextWeeks = () => setStartDate(prev => addDays(prev, 7 * weeks));
  const handlePrevOneWeek = () => setStartDate(prev => addDays(prev, -7));
  const handleNextOneWeek = () => setStartDate(prev => addDays(prev, 7));
  const handleCurrentWeek = () => setStartDate(snapToMonday(new Date()));

  const days: any[] = timelineData?.days || [];
  const todayIso = new Date().toISOString().split('T')[0];
  const thresholds = timelineData?.headcountThresholds || { baseline: 11, lowMin: 8, lowMax: 10, critical: 8, overbooked: 11 };

  // Helper for headcount health color
  const getCountStyle = (count: number) => {
    if (count < thresholds.critical) {
      return { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' }; // Critical Red
    }
    if (count <= thresholds.lowMax) {
      return { bg: '#fef9c3', text: '#854d0e', border: '#fef08a' }; // Low Staffing Yellow
    }
    if (count === thresholds.baseline) {
      return { bg: '#dcfce7', text: '#166534', border: '#bbf7d0' }; // Baseline Green
    }
    return { bg: '#e0f2fe', text: '#0369a1', border: '#bae6fd' }; // Overbooked Blue
  };

  // Group days by month for the top month header bar
  const monthGroups: { monthName: string; colSpan: number }[] = [];
  days.forEach((day) => {
    if (monthGroups.length === 0 || monthGroups[monthGroups.length - 1].monthName !== day.monthName) {
      monthGroups.push({ monthName: day.monthName, colSpan: 1 });
    } else {
      monthGroups[monthGroups.length - 1].colSpan += 1;
    }
  });

  const renderTimelineRow = (person: any) => {
    const barColor = getBarColor(person.id);
    const activeDateSet = new Set(person.activeDates || []);

    return (
      <tr key={person.id} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#fff' }}>
        {/* Col A: Gender */}
        <td style={{ padding: '0.4rem 0.5rem', textAlign: 'center', fontWeight: 'bold', fontSize: '1rem', borderRight: '1px solid #e2e8f0', width: '32px' }}>
          {person.gender === 'Male' && <span style={{ color: '#2563eb' }} title="Male">♂</span>}
          {person.gender === 'Female' && <span style={{ color: '#db2777' }} title="Female">♀</span>}
          {person.gender === 'Neutral' && <span style={{ color: '#9333ea' }} title="Neutral">⚧</span>}
          {(person.gender === 'Unspecified' || !person.gender) && <span style={{ color: '#94a3b8' }} title="Unspecified">⚪</span>}
        </td>

        {/* Col B: Name with Flag */}
        <td style={{ padding: '0.4rem 0.6rem', borderRight: '1px solid #e2e8f0', whiteSpace: 'nowrap', fontWeight: '600', fontSize: '0.875rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <CountryFlag countryCode={person.nationality} />
            <span>{person.preferredName || person.fullName}</span>
          </div>
        </td>

        {/* Col D: Age */}
        <td style={{ padding: '0.4rem 0.5rem', borderRight: '1px solid #e2e8f0', textAlign: 'center', fontSize: '0.8rem', color: '#475569', width: '36px' }}>
          {person.age !== null ? person.age : '??'}
        </td>

        {/* Col E: Source */}
        <td style={{ padding: '0.4rem 0.6rem', borderRight: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#334155', whiteSpace: 'nowrap' }}>
          {person.source || 'Other'}
        </td>

        {/* Col F: Status Badge */}
        <td style={{ padding: '0.4rem 0.6rem', borderRight: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>
          <span style={{
            fontSize: '0.75rem',
            padding: '0.15rem 0.45rem',
            borderRadius: '4px',
            fontWeight: '600',
            backgroundColor: person.status === 'Active' ? '#dcfce7' : person.status === 'Accepted' ? '#dbeafe' : '#fef9c3',
            color: person.status === 'Active' ? '#166534' : person.status === 'Accepted' ? '#1e40af' : '#854d0e',
            border: `1px solid ${person.status === 'Active' ? '#bbf7d0' : person.status === 'Accepted' ? '#bfdbfe' : '#fef08a'}`
          }}>
            {person.status === 'Active' ? 'In da house' : person.status === 'Accepted' ? 'Confirmed' : 'Not confirmed'}
          </span>
        </td>

        {/* Col G: Arrival */}
        <td style={{ padding: '0.4rem 0.6rem', borderRight: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#475569', whiteSpace: 'nowrap' }}>
          {person.arrivalDate ? formatDate(person.arrivalDate) : (person.isStaff ? 'Permanent' : 'TBD')}
        </td>

        {/* Col I: Leaving */}
        <td style={{ padding: '0.4rem 0.6rem', borderRight: '2px solid #cbd5e1', fontSize: '0.8rem', color: '#475569', whiteSpace: 'nowrap' }}>
          {person.noEndDate ? '???' : (person.departureDate ? formatDate(person.departureDate) : (person.isStaff ? 'Permanent' : '???'))}
        </td>

        {/* Days Columns */}
        {days.map((day) => {
          const isOnSite = activeDateSet.has(day.date);
          const isToday = day.date === todayIso;

          return (
            <td
              key={day.date}
              style={{
                padding: 0,
                width: '32px',
                minWidth: '32px',
                maxWidth: '32px',
                textAlign: 'center',
                borderRight: '1px solid #e2e8f0',
                backgroundColor: isOnSite ? barColor : (isToday ? '#f0fdf4' : 'transparent'),
                color: isOnSite ? '#fff' : 'transparent',
                fontWeight: 'bold',
                fontSize: '0.75rem',
                userSelect: 'none'
              }}
              title={isOnSite ? `${person.preferredName}: On site on ${day.date}` : undefined}
            >
              {isOnSite ? '1' : ''}
            </td>
          );
        })}
      </tr>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
      {/* Top Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: '0 0 0.25rem 0' }}>Staffing Timeline</h2>
          <span style={{ fontSize: '0.85rem', color: '#71717a' }}>
            Multi-week visual occupancy overview across Reception, Housekeeping, and Applicants.
          </span>
        </div>

        {/* Navigation & Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={handlePrevWeeks}
            style={{ padding: '0.4rem 0.75rem', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500' }}
            title={`Go back ${weeks} weeks`}
          >
            &laquo; {weeks}w
          </button>
          <button
            onClick={handlePrevOneWeek}
            style={{ padding: '0.4rem 0.75rem', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
            title="Go back 1 week"
          >
            ‹ 1w
          </button>
          <button
            onClick={handleCurrentWeek}
            style={{ padding: '0.4rem 0.9rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}
          >
            Today / This Week
          </button>
          <button
            onClick={handleNextOneWeek}
            style={{ padding: '0.4rem 0.75rem', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
            title="Advance 1 week"
          >
            1w ›
          </button>
          <button
            onClick={handleNextWeeks}
            style={{ padding: '0.4rem 0.75rem', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500' }}
            title={`Advance ${weeks} weeks`}
          >
            {weeks}w &raquo;
          </button>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', color: '#475569', marginLeft: '0.5rem' }}>
            Horizon:
            <select
              value={weeks}
              onChange={(e) => setWeeks(parseInt(e.target.value, 10) || 5)}
              style={{ padding: '0.35rem 0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: '#fff' }}
            >
              <option value={4}>4 Weeks</option>
              <option value={5}>5 Weeks (Default)</option>
              <option value={6}>6 Weeks</option>
              <option value={8}>8 Weeks</option>
            </select>
          </label>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#71717a' }}>Loading staffing timeline...</div>
      ) : (
        /* Spreadsheet Layout Container */
        <div style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', overflowX: 'auto', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '0.85rem' }}>
            <thead>
              {/* Row 1: Month Groups */}
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
                <th colSpan={7} style={{ padding: '0.5rem', textAlign: 'left', borderRight: '2px solid #cbd5e1', fontWeight: 'bold', color: '#334155' }}>
                  Personnel Details
                </th>
                {monthGroups.map((mg, idx) => (
                  <th
                    key={idx}
                    colSpan={mg.colSpan}
                    style={{
                      padding: '0.4rem',
                      textAlign: 'center',
                      backgroundColor: idx % 2 === 0 ? '#15803d' : '#b91c1c',
                      color: '#fff',
                      fontWeight: 'bold',
                      fontSize: '0.85rem',
                      borderRight: '1px solid rgba(255,255,255,0.3)',
                      letterSpacing: '0.05em'
                    }}
                  >
                    {mg.monthName}
                  </th>
                ))}
              </tr>

              {/* Row 2: Columns & Day of Month Numbers */}
              <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                <th style={{ padding: '0.4rem 0.5rem', width: '32px', borderRight: '1px solid #cbd5e1' }}>Sex</th>
                <th style={{ padding: '0.4rem 0.6rem', textAlign: 'left', borderRight: '1px solid #cbd5e1' }}>Name</th>
                <th style={{ padding: '0.4rem 0.5rem', width: '36px', borderRight: '1px solid #cbd5e1' }}>Age</th>
                <th style={{ padding: '0.4rem 0.6rem', textAlign: 'left', borderRight: '1px solid #cbd5e1' }}>Source</th>
                <th style={{ padding: '0.4rem 0.6rem', textAlign: 'left', borderRight: '1px solid #cbd5e1' }}>Status</th>
                <th style={{ padding: '0.4rem 0.6rem', textAlign: 'left', borderRight: '1px solid #cbd5e1' }}>Arrival</th>
                <th style={{ padding: '0.4rem 0.6rem', textAlign: 'left', borderRight: '2px solid #cbd5e1' }}>Departing</th>

                {days.map((day) => {
                  const isToday = day.date === todayIso;
                  const isWeekend = day.dayOfWeek === 0 || day.dayOfWeek === 6;

                  return (
                    <th
                      key={day.date}
                      style={{
                        padding: '0.35rem 0.1rem',
                        width: '32px',
                        minWidth: '32px',
                        maxWidth: '32px',
                        textAlign: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        borderRight: '1px solid #cbd5e1',
                        backgroundColor: isToday ? '#bbf7d0' : isWeekend ? '#e2e8f0' : '#f1f5f9',
                        color: isToday ? '#166534' : '#1e293b'
                      }}
                      title={`${day.dayName}, ${day.date}`}
                    >
                      <div>{day.dayOfMonth}</div>
                      <div style={{ fontSize: '0.65rem', fontWeight: 'normal', color: '#64748b' }}>{day.dayName.slice(0, 1)}</div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {/* SECTION 1: RECEPTION VOLUNTEERS */}
              <tr style={{ backgroundColor: '#e2e8f0', borderTop: '2px solid #94a3b8', borderBottom: '1px solid #cbd5e1' }}>
                <td colSpan={7 + days.length} style={{ padding: '0.4rem 0.75rem', fontWeight: 'bold', color: '#0f172a', letterSpacing: '0.025em' }}>
                  🛎️ Reception (Volunteers)
                </td>
              </tr>
              {timelineData?.reception?.map(renderTimelineRow)}
              {timelineData?.reception?.length === 0 && (
                <tr>
                  <td colSpan={7 + days.length} style={{ padding: '1rem', textAlign: 'center', color: '#94a3b8' }}>
                    No reception volunteers currently scheduled in this window.
                  </td>
                </tr>
              )}

              {/* SECTION 2: HOUSEKEEPING VOLUNTEERS */}
              <tr style={{ backgroundColor: '#e2e8f0', borderTop: '2px solid #94a3b8', borderBottom: '1px solid #cbd5e1' }}>
                <td colSpan={7 + days.length} style={{ padding: '0.4rem 0.75rem', fontWeight: 'bold', color: '#0f172a', letterSpacing: '0.025em' }}>
                  🧹 Housekeeping (Volunteers)
                </td>
              </tr>
              {timelineData?.housekeeping?.map(renderTimelineRow)}
              {timelineData?.housekeeping?.length === 0 && (
                <tr>
                  <td colSpan={7 + days.length} style={{ padding: '1rem', textAlign: 'center', color: '#94a3b8' }}>
                    No housekeeping volunteers currently scheduled in this window.
                  </td>
                </tr>
              )}

              {/* SECTION 3: TOTAL CONFIRMED VOLUNTEERS ROW */}
              <tr style={{ backgroundColor: '#f8fafc', borderTop: '2px solid #64748b', borderBottom: '2px solid #64748b' }}>
                <td
                  colSpan={7}
                  style={{
                    padding: '0.6rem 0.75rem',
                    textAlign: 'right',
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    color: '#0f172a',
                    borderRight: '2px solid #cbd5e1',
                    letterSpacing: '0.025em'
                  }}
                >
                  Total CONFIRMED Volunteers
                </td>
                {days.map((day) => {
                  const count = timelineData?.dailyConfirmedCounts?.[day.date] || 0;
                  const style = getCountStyle(count);

                  return (
                    <td
                      key={day.date}
                      style={{
                        padding: '0.4rem 0.1rem',
                        width: '32px',
                        minWidth: '32px',
                        maxWidth: '32px',
                        textAlign: 'center',
                        fontWeight: 'bold',
                        fontSize: '0.85rem',
                        borderRight: '1px solid #cbd5e1',
                        backgroundColor: style.bg,
                        color: style.text
                      }}
                      title={`${count} confirmed volunteers on ${day.date}`}
                    >
                      {count}
                    </td>
                  );
                })}
              </tr>

              {/* SECTION 4: APPLIED (UNCONFIRMED CANDIDATES) */}
              <tr style={{ backgroundColor: '#e2e8f0', borderTop: '2px solid #94a3b8', borderBottom: '1px solid #cbd5e1' }}>
                <td colSpan={7 + days.length} style={{ padding: '0.4rem 0.75rem', fontWeight: 'bold', color: '#475569', letterSpacing: '0.025em' }}>
                  📋 Unconfirmed (Applied Candidates)
                </td>
              </tr>
              {timelineData?.applied?.map(renderTimelineRow)}
              {timelineData?.applied?.length === 0 && (
                <tr>
                  <td colSpan={7 + days.length} style={{ padding: '1rem', textAlign: 'center', color: '#94a3b8' }}>
                    No applied candidates in this date window.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
