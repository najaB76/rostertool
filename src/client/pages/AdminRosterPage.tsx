import React, { useEffect, useState } from 'react';
import { RosterGrid } from '../components/RosterGrid';
import { ShiftAssignModal, ShiftSlotInfo } from '../components/ShiftAssignModal';
import { snapToMonday, addDays, getSunday, formatDate } from '../utils/date-utils';

export const AdminRosterPage: React.FC = () => {
  const [rosterData, setRosterData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<ShiftSlotInfo | null>(null);

  const [weekStartDate, setWeekStartDate] = useState(snapToMonday(new Date()));
  const weekEndDate = getSunday(weekStartDate);

  const fetchRoster = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/roster?weekStartDate=${weekStartDate}`);
      const data = await res.json();
      setRosterData(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRoster();
  }, [weekStartDate]);

  const handlePrevWeek = () => setWeekStartDate(prev => addDays(prev, -7));
  const handleNextWeek = () => setWeekStartDate(prev => addDays(prev, 7));
  const handleThisWeek = () => setWeekStartDate(snapToMonday(new Date()));

  const handleAssignClick = (
    shiftDefinitionId: string,
    date: string,
    shiftName: string,
    durationHours: number,
    minStaff: number,
    currentAssignments: any[]
  ) => {
    setSelectedSlot({
      shiftDefinitionId,
      date,
      shiftName,
      durationHours,
      minStaff,
      currentAssignments
    });
  };

  const handleCandidateAssign = async (volunteerId: string | null, staffId: string | null) => {
    if (!selectedSlot) return;
    try {
      await fetch('/api/admin/roster/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shiftDefinitionId: selectedSlot.shiftDefinitionId,
          date: selectedSlot.date,
          volunteerId,
          staffId
        })
      });
      setSelectedSlot(null);
      fetchRoster();
    } catch (err) {
      console.error('Failed to assign candidate:', err);
      alert('Failed to assign candidate');
    }
  };

  const handleRemoveClick = (shiftDefId: string, date: string, volunteerId?: string | null, staffId?: string | null) => {
    if (window.confirm("Remove this assignment?")) {
      fetch('/api/admin/roster/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shiftDefinitionId: shiftDefId, date, volunteerId: volunteerId || null, staffId: staffId || null })
      }).then(() => fetchRoster());
    }
  };

  const handleAutoPopulate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/roster/auto-populate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weekStartDate })
      });
      const result = await res.json();
      if (result.success) {
        alert(`Auto-populate complete! Assignments created: ${result.assignments.length}`);
      } else {
        alert(`Error: ${result.error}`);
      }
      fetchRoster();
    } catch (e) {
      console.error(e);
      alert('Failed to auto-populate');
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: '0 0 0.25rem 0' }}>Weekly Roster</h2>
          <div style={{ fontSize: '0.9rem', color: '#475569', fontWeight: '500' }}>
            🗓️ Week of <strong>Monday, {formatDate(weekStartDate)}</strong> to <strong>Sunday, {formatDate(weekEndDate)}</strong>
          </div>
        </div>

        {/* Navigation Toolbar */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button 
            onClick={handlePrevWeek}
            style={{ padding: '0.45rem 0.75rem', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
            title="Go to previous week"
          >
            ← Previous Week
          </button>
          <button 
            onClick={handleThisWeek}
            style={{ padding: '0.45rem 0.75rem', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500' }}
            title="Go to current week"
          >
            This Week
          </button>
          <button 
            onClick={handleNextWeek}
            style={{ padding: '0.45rem 0.75rem', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
            title="Go to next week"
          >
            Next Week →
          </button>

          <input 
            type="date" 
            value={weekStartDate} 
            onChange={(e) => {
              if (e.target.value) setWeekStartDate(snapToMonday(e.target.value));
            }} 
            style={{ padding: '0.45rem', borderRadius: '4px', border: '1px solid #d4d4d8', cursor: 'pointer' }}
            title="Select date (automatically snaps to Monday)"
          />

          <button 
            onClick={handleAutoPopulate}
            style={{ padding: '0.5rem 1rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}
          >
            ⚡ Auto-Populate
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#71717a' }}>Loading roster...</div>
      ) : (
        <RosterGrid 
          days={rosterData?.days} 
          onAssignClick={handleAssignClick}
          onRemoveClick={handleRemoveClick}
        />
      )}

      {/* Interactive Shift Assignment Modal */}
      {selectedSlot && (
        <ShiftAssignModal
          isOpen={!!selectedSlot}
          shift={selectedSlot}
          onAssign={handleCandidateAssign}
          onClose={() => setSelectedSlot(null)}
        />
      )}
    </div>
  );
};
