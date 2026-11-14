import React, { useEffect, useState } from 'react';
import { CountryFlag } from '../components/CountryFlag';
import { snapToMonday, addDays } from '../utils/date-utils';
import { useDateFormat } from '../context/DateFormatContext';
import { VolunteerModal } from '../components/VolunteerModal';
import { DepartureModal } from '../components/DepartureModal';
import { ReactivateModal } from '../components/ReactivateModal';

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
  const { formatDate } = useDateFormat();
  const [startDate, setStartDate] = useState(snapToMonday(new Date()));
  const [weeks, setWeeks] = useState(5);
  const [timelineData, setTimelineData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modals and action menu states
  const [editingVol, setEditingVol] = useState<any>(null);
  const [departingVol, setDepartingVol] = useState<any>(null);
  const [reactivatingVol, setReactivatingVol] = useState<any>(null);
  const [activeMenuVolId, setActiveMenuVolId] = useState<string | null>(null);

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

  // Close status dropdown menu when clicking anywhere else
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.timeline-status-menu-container')) {
        setActiveMenuVolId(null);
      }
    };
    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, []);

  const handlePrevWeeks = () => setStartDate(prev => addDays(prev, -7 * weeks));
  const handleNextWeeks = () => setStartDate(prev => addDays(prev, 7 * weeks));
  const handlePrevOneWeek = () => setStartDate(prev => addDays(prev, -7));
  const handleNextOneWeek = () => setStartDate(prev => addDays(prev, 7));
  const handleCurrentWeek = () => setStartDate(snapToMonday(new Date()));

  // Handlers for volunteer actions directly from timeline
  const handleOpenEdit = async (volId: string) => {
    try {
      const res = await fetch(`/api/admin/volunteers/${volId}`);
      if (res.ok) {
        const fullVol = await res.json();
        setEditingVol(fullVol);
      }
    } catch (e) {
      console.error('Failed to load volunteer:', e);
    }
  };

  const handleSaveVolunteer = async (data: any) => {
    if (!editingVol) return;
    try {
      await fetch(`/api/admin/volunteers/${editingVol.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      setEditingVol(null);
      fetchTimeline();
    } catch (e) {
      console.error('Failed to save volunteer:', e);
    }
  };

  const handleMarkArrived = async (id: string) => {
    try {
      await fetch(`/api/admin/volunteers/${id}/activate`, { method: 'POST' });
      setActiveMenuVolId(null);
      fetchTimeline();
    } catch (e) {
      console.error('Failed to activate volunteer:', e);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await fetch(`/api/admin/volunteers/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      setActiveMenuVolId(null);
      fetchTimeline();
    } catch (e) {
      console.error('Failed to change status:', e);
    }
  };

  const handleCancel = async (id: string) => {
    const reason = prompt('Cancellation reason (optional):');
    if (reason !== null) {
      try {
        await fetch(`/api/admin/volunteers/${id}/cancel`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cancellationReason: reason })
        });
        setActiveMenuVolId(null);
        fetchTimeline();
      } catch (e) {
        console.error('Failed to cancel volunteer:', e);
      }
    }
  };

  const handleConfirmDepart = async (data: { departureRating: number; departureNotes: string; rehireStatus: string }) => {
    if (!departingVol) return;
    try {
      await fetch(`/api/admin/volunteers/${departingVol.id}/depart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      setDepartingVol(null);
      fetchTimeline();
    } catch (e) {
      console.error('Failed to depart volunteer:', e);
    }
  };

  const handleConfirmReactivate = async (data: { arrivalDate: string; departureDate?: string | null; noEndDate?: boolean }) => {
    if (!reactivatingVol) return;
    try {
      await fetch(`/api/admin/volunteers/${reactivatingVol.id}/reactivate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      setReactivatingVol(null);
      fetchTimeline();
    } catch (e) {
      console.error('Failed to reactivate volunteer:', e);
    }
  };

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
    const isMenuOpen = activeMenuVolId === person.id;

    return (
      <tr key={`${person.id}_${person.arrivalDate}`} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#fff' }}>
        {/* Col A: Gender */}
        <td style={{ padding: '0.4rem 0.5rem', textAlign: 'center', fontWeight: 'bold', fontSize: '1rem', borderRight: '1px solid #e2e8f0', width: '32px' }}>
          {person.gender === 'Male' && <span style={{ color: '#2563eb' }} title="Male">♂</span>}
          {person.gender === 'Female' && <span style={{ color: '#db2777' }} title="Female">♀</span>}
          {person.gender === 'Neutral' && <span style={{ color: '#9333ea' }} title="Neutral">⚧</span>}
          {(person.gender === 'Unspecified' || !person.gender) && <span style={{ color: '#94a3b8' }} title="Unspecified">⚪</span>}
        </td>

        {/* Col B: Name with Flag (Clickable to Edit) */}
        <td style={{ padding: '0.4rem 0.6rem', borderRight: '1px solid #e2e8f0', whiteSpace: 'nowrap', fontWeight: '600', fontSize: '0.875rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <CountryFlag countryCode={person.nationality} />
            <button
              onClick={() => handleOpenEdit(person.id)}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                color: '#2563eb',
                textDecoration: 'underline',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.875rem',
                textAlign: 'left'
              }}
              title="Click to edit volunteer details"
            >
              {person.preferredName || person.fullName}
            </button>
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

        {/* Col F: Interactive Status Button with Action Menu */}
        <td style={{ padding: '0.4rem 0.6rem', borderRight: '1px solid #e2e8f0', whiteSpace: 'nowrap', position: 'relative' }} className="timeline-status-menu-container">
          <button
            onClick={() => setActiveMenuVolId(isMenuOpen ? null : person.id)}
            style={{
              fontSize: '0.75rem',
              padding: '0.2rem 0.5rem',
              borderRadius: '4px',
              fontWeight: '600',
              cursor: 'pointer',
              backgroundColor: person.status === 'Active' ? '#dcfce7' : person.status === 'Accepted' ? '#dbeafe' : person.status === 'Departed' ? '#fee2e2' : '#fef9c3',
              color: person.status === 'Active' ? '#166534' : person.status === 'Accepted' ? '#1e40af' : person.status === 'Departed' ? '#991b1b' : '#854d0e',
              border: `1px solid ${person.status === 'Active' ? '#bbf7d0' : person.status === 'Accepted' ? '#bfdbfe' : person.status === 'Departed' ? '#fecaca' : '#fef08a'}`
            }}
            title="Click to change volunteer status"
          >
            {person.status === 'Active' ? 'In da house ▾' : person.status === 'Accepted' ? 'Confirmed ▾' : person.status === 'Departed' ? 'Departed ▾' : 'Not confirmed ▾'}
          </button>

          {/* Action Menu Dropdown */}
          {isMenuOpen && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: '0.6rem',
                zIndex: 50,
                backgroundColor: '#fff',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
                minWidth: '160px',
                display: 'flex',
                flexDirection: 'column',
                padding: '0.35rem 0',
                marginTop: '2px'
              }}
            >
              {(person.status === 'Active' || person.currentStatus === 'Active') && (
                <>
                  <button
                    onClick={() => { setActiveMenuVolId(null); setDepartingVol(person); }}
                    style={{ textAlign: 'left', padding: '0.45rem 0.75rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: '#b91c1c' }}
                  >
                    🚪 Depart (Checkout)...
                  </button>
                  <button
                    onClick={() => handleStatusChange(person.id, 'Accepted')}
                    style={{ textAlign: 'left', padding: '0.45rem 0.75rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: '#1e40af' }}
                  >
                    ↩ Revert to Confirmed
                  </button>
                </>
              )}

              {person.status === 'Accepted' && (
                <>
                  <button
                    onClick={() => handleMarkArrived(person.id)}
                    style={{ textAlign: 'left', padding: '0.45rem 0.75rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: '#15803d', fontWeight: 'bold' }}
                  >
                    ✓ Mark Arrived (In da house)
                  </button>
                  <button
                    onClick={() => handleCancel(person.id)}
                    style={{ textAlign: 'left', padding: '0.45rem 0.75rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: '#b91c1c' }}
                  >
                    ✕ Cancel Application
                  </button>
                </>
              )}

              {person.status === 'Departed' && (
                <button
                  onClick={() => { setActiveMenuVolId(null); setReactivatingVol(person); }}
                  style={{ textAlign: 'left', padding: '0.45rem 0.75rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: '#15803d', fontWeight: 'bold' }}
                >
                  🔄 Re-activate (New Stay)...
                </button>
              )}

              {person.status === 'Applied' && (
                <>
                  <button
                    onClick={() => { setActiveMenuVolId(null); handleOpenEdit(person.id); }}
                    style={{ textAlign: 'left', padding: '0.45rem 0.75rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: '#15803d', fontWeight: 'bold' }}
                  >
                    ✓ Accept Application...
                  </button>
                  <button
                    onClick={() => handleCancel(person.id)}
                    style={{ textAlign: 'left', padding: '0.45rem 0.75rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: '#b91c1c' }}
                  >
                    ✕ Cancel Application
                  </button>
                </>
              )}
            </div>
          )}
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
          const isDepartureDay = !person.noEndDate && person.departureDate === day.date;

          let background = 'transparent';
          if (isOnSite) {
            if (isDepartureDay) {
              // Lighter hatched diagonal pattern for departure day
              background = `repeating-linear-gradient(45deg, ${barColor}, ${barColor} 4px, #ffffff 4px, #ffffff 8px)`;
            } else {
              // Solid intense color for main stay
              background = barColor;
            }
          } else if (isToday) {
            background = '#f0fdf4';
          }

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
                background,
                userSelect: 'none'
              }}
              title={
                isOnSite
                  ? isDepartureDay
                    ? `${person.preferredName}: Departure / Checkout on ${day.date} (vacates bed)`
                    : `${person.preferredName}: On site on ${day.date}`
                  : undefined
              }
            />
          );
        })}
      </tr>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
      {/* Top Header & Navigation Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: '0 0 0.25rem 0' }}>Staffing Timeline</h2>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
            5-week operational volunteer spreadsheet showing daily occupancy, arrivals, and departures.
          </span>
        </div>

        {/* Navigation Controls */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', backgroundColor: '#fff', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
          <button 
            onClick={handlePrevWeeks}
            style={{ padding: '0.35rem 0.6rem', border: '1px solid #cbd5e1', borderRadius: '4px', background: '#f8fafc', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}
            title={`Previous ${weeks} weeks`}
          >
            « {weeks}w
          </button>
          <button 
            onClick={handlePrevOneWeek}
            style={{ padding: '0.35rem 0.6rem', border: '1px solid #cbd5e1', borderRadius: '4px', background: '#f8fafc', cursor: 'pointer', fontSize: '0.8rem' }}
            title="Previous 1 week"
          >
            ‹ 1w
          </button>
          <button 
            onClick={handleCurrentWeek}
            style={{ padding: '0.35rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px', background: '#e2e8f0', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}
          >
            Today
          </button>
          <button 
            onClick={handleNextOneWeek}
            style={{ padding: '0.35rem 0.6rem', border: '1px solid #cbd5e1', borderRadius: '4px', background: '#f8fafc', cursor: 'pointer', fontSize: '0.8rem' }}
            title="Next 1 week"
          >
            1w ›
          </button>
          <button 
            onClick={handleNextWeeks}
            style={{ padding: '0.35rem 0.6rem', border: '1px solid #cbd5e1', borderRadius: '4px', background: '#f8fafc', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}
            title={`Next ${weeks} weeks`}
          >
            {weeks}w »
          </button>

          <span style={{ borderLeft: '1px solid #cbd5e1', height: '1.25rem', margin: '0 0.25rem' }} />

          <label style={{ fontSize: '0.8rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            Weeks:
            <select
              value={weeks}
              onChange={(e) => setWeeks(parseInt(e.target.value, 10))}
              style={{ padding: '0.25rem 0.4rem', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: '#fff', fontSize: '0.8rem' }}
            >
              <option value="3">3 weeks</option>
              <option value="4">4 weeks</option>
              <option value="5">5 weeks</option>
              <option value="6">6 weeks</option>
              <option value="8">8 weeks</option>
            </select>
          </label>
        </div>
      </div>

      {loading && !timelineData ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading staffing timeline...</div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', overflowX: 'auto', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left', minWidth: '950px' }}>
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
                        color: isToday ? '#14532d' : isWeekend ? '#334155' : '#0f172a'
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

              {/* SECTION 5: TOTAL APPLIED CANDIDATES ROW */}
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
                  Total APPLIED Candidates
                </td>
                {days.map((day) => {
                  const count = timelineData?.dailyAppliedCounts?.[day.date] || 0;

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
                        backgroundColor: count > 0 ? '#fef9c3' : 'transparent',
                        color: count > 0 ? '#854d0e' : '#94a3b8'
                      }}
                      title={`${count} applied candidates on ${day.date}`}
                    >
                      {count}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Volunteer Modal */}
      {editingVol && (
        <VolunteerModal
          volunteer={editingVol}
          onSave={handleSaveVolunteer}
          onClose={() => setEditingVol(null)}
        />
      )}

      {/* 5-Star Departure Modal */}
      {departingVol && (
        <DepartureModal
          isOpen={Boolean(departingVol)}
          volunteer={departingVol}
          onClose={() => setDepartingVol(null)}
          onSubmit={handleConfirmDepart}
        />
      )}

      {/* Re-activate New Stay Modal */}
      {reactivatingVol && (
        <ReactivateModal
          isOpen={Boolean(reactivatingVol)}
          volunteer={reactivatingVol}
          onClose={() => setReactivatingVol(null)}
          onSubmit={handleConfirmReactivate}
        />
      )}
    </div>
  );
};
