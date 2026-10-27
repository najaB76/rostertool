import React from 'react';
import { CountryFlag } from './CountryFlag.js';

interface Assignment {
  assignmentId: string;
  volunteer?: { id: string; fullName: string; nationality: string; primaryRole: string } | null;
  staff?: { id: string; fullName: string } | null;
}

interface ShiftSlotCellProps {
  shiftName: string;
  minStaff: number;
  assignments: Assignment[];
  isUnderstaffed: boolean;
  onAssignClick: () => void;
  onRemoveClick: (volunteerId?: string | null, staffId?: string | null) => void;
}

export const ShiftSlotCell: React.FC<ShiftSlotCellProps> = ({
  shiftName,
  minStaff,
  assignments,
  isUnderstaffed,
  onAssignClick,
  onRemoveClick,
}) => {
  return (
    <div
      className={`shift-slot-cell ${isUnderstaffed ? 'understaffed' : ''}`}
      style={{
        border: '1px solid #e4e4e7',
        padding: '0.75rem',
        borderRadius: '6px',
        backgroundColor: isUnderstaffed ? '#fef2f2' : '#fff',
        minHeight: '80px',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong style={{ fontSize: '0.85rem', color: '#52525b' }}>{shiftName}</strong>
        <span style={{ fontSize: '0.75rem', color: isUnderstaffed ? '#ef4444' : '#10b981' }}>
          {assignments.length} / {minStaff}
        </span>
      </div>

      <div className="assignments-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {assignments.map((assignment, idx) => (
          <div key={assignment.assignmentId || idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', backgroundColor: '#f4f4f5', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
            <span>
              {assignment.volunteer ? (
                <>
                  {assignment.volunteer.fullName}
                  <CountryFlag countryCode={assignment.volunteer.nationality} />
                </>
              ) : assignment.staff ? (
                <>{assignment.staff.fullName} <em>(Staff)</em></>
              ) : (
                'Unknown'
              )}
            </span>
            <button
              onClick={() => onRemoveClick(assignment.volunteer?.id, assignment.staff?.id)}
              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.2rem', lineHeight: 1 }}
              title="Remove"
            >
              &times;
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={onAssignClick}
        style={{
          marginTop: 'auto',
          padding: '0.25rem',
          border: '1px dashed #d4d4d8',
          background: 'transparent',
          color: '#71717a',
          cursor: 'pointer',
          borderRadius: '4px',
          fontSize: '0.8rem',
        }}
      >
        + Assign
      </button>
    </div>
  );
};
