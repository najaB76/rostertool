import React from 'react';
import { ShiftSlotCell } from './ShiftSlotCell';

interface RosterGridProps {
  days: {
    date: string;
    dayOfWeek: number;
    shifts: {
      shiftDefinition: any;
      assignments: any[];
      isUnderstaffed: boolean;
    }[];
  }[];
  onAssignClick: (shiftDefId: string, date: string) => void;
  onRemoveClick: (shiftDefId: string, date: string, volunteerId?: string | null, staffId?: string | null) => void;
}

const getDayName = (dateStr: string) => {
  return new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date(dateStr));
};

export const RosterGrid: React.FC<RosterGridProps> = ({ days, onAssignClick, onRemoveClick }) => {
  if (!days || days.length === 0) return <div>No roster data available.</div>;

  return (
    <div className="roster-grid" style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: '1rem',
      width: '100%',
      overflowX: 'auto',
    }}>
      {days.map(day => (
        <div key={day.date} className="roster-day-column" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ textAlign: 'center', padding: '0.5rem', backgroundColor: '#e4e4e7', borderRadius: '4px' }}>
            <div style={{ fontWeight: 'bold' }}>{getDayName(day.date)}</div>
            <div style={{ fontSize: '0.85rem', color: '#52525b' }}>{day.date}</div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {day.shifts.map(shift => (
              <ShiftSlotCell
                key={`${shift.shiftDefinition.id}-${day.date}`}
                shiftName={shift.shiftDefinition.name}
                date={day.date}
                minStaff={shift.shiftDefinition.minStaff}
                assignments={shift.assignments}
                isUnderstaffed={shift.isUnderstaffed}
                onAssignClick={() => onAssignClick(shift.shiftDefinition.id, day.date)}
                onRemoveClick={(volunteerId, staffId) => onRemoveClick(shift.shiftDefinition.id, day.date, volunteerId, staffId)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
