import React, { useEffect, useState } from 'react';
import { RosterGrid } from '../components/RosterGrid';

export const AdminRosterPage: React.FC = () => {
  const [rosterData, setRosterData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Start with the upcoming Monday or current Monday
  const getMonday = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff)).toISOString().split('T')[0];
  };

  const [weekStartDate, setWeekStartDate] = useState(getMonday(new Date()));

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

  const handleAssignClick = (shiftDefId: string, date: string) => {
    // In a full implementation, this would open a proper dropdown modal
    const type = window.prompt("Type 'v' to assign volunteer, 's' for staff:");
    if (!type) return;

    if (type.toLowerCase() === 'v') {
      const volId = prompt("Enter Volunteer ID:");
      if (volId) {
        fetch('/api/admin/roster/assign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ shiftDefinitionId: shiftDefId, date, volunteerId: volId })
        }).then(() => fetchRoster());
      }
    } else if (type.toLowerCase() === 's') {
      const staffId = prompt("Enter Staff ID:");
      if (staffId) {
        fetch('/api/admin/roster/assign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ shiftDefinitionId: shiftDefId, date, staffId: staffId })
        }).then(() => fetchRoster());
      }
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Weekly Roster</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input 
            type="date" 
            value={weekStartDate} 
            onChange={(e) => setWeekStartDate(e.target.value)} 
          />
          <button 
            onClick={handleAutoPopulate}
            style={{ padding: '0.5rem 1rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Auto-Populate
          </button>
        </div>
      </div>

      {loading ? (
        <div>Loading roster...</div>
      ) : (
        <RosterGrid 
          days={rosterData?.days} 
          onAssignClick={handleAssignClick}
          onRemoveClick={handleRemoveClick}
        />
      )}
    </div>
  );
};
