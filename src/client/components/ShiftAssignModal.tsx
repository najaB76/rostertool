import React, { useState, useEffect } from 'react';
import { CountryFlag } from './CountryFlag';

export interface ShiftSlotInfo {
  shiftDefinitionId: string;
  shiftName: string;
  date: string;
  durationHours: number;
  minStaff: number;
  currentAssignments: any[];
}

interface ShiftAssignModalProps {
  isOpen: boolean;
  shift: ShiftSlotInfo | null;
  onAssign: (volunteerId: string | null, staffId: string | null) => void;
  onClose: () => void;
}

export const ShiftAssignModal: React.FC<ShiftAssignModalProps> = ({
  isOpen,
  shift,
  onAssign,
  onClose,
}) => {
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [timeOff, setTimeOff] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && shift) {
      setLoading(true);
      Promise.all([
        fetch('/api/admin/volunteers?status=Active').then(r => r.json()),
        fetch('/api/admin/staff').then(r => r.json()),
        fetch('/api/admin/time-off?status=Approved').then(r => r.json()),
      ])
        .then(([volsData, staffData, timeOffData]) => {
          setVolunteers(Array.isArray(volsData) ? volsData : []);
          setStaff(Array.isArray(staffData) ? staffData : []);
          setTimeOff(Array.isArray(timeOffData) ? timeOffData : []);
        })
        .catch(err => console.error('Error loading candidates:', err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, shift]);

  if (!isOpen || !shift) return null;

  const isReceptionShift = shift.shiftName.toLowerCase().includes('reception');

  const filteredVolunteers = volunteers.filter(v => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return v.fullName.toLowerCase().includes(q) || v.nationality.toLowerCase().includes(q);
  });

  const filteredStaff = staff.filter(s => {
    if (!search.trim()) return true;
    return s.fullName.toLowerCase().includes(search.toLowerCase());
  });

  const handleVolunteerAssign = (v: any, hasApprovedTimeOff: boolean) => {
    if (hasApprovedTimeOff) {
      const ok = window.confirm(
        `Warning: ${v.fullName} has APPROVED TIME-OFF on ${shift.date}.\n\nAre you sure you want to override and assign them to this shift anyway?`
      );
      if (!ok) return;
    }
    onAssign(v.id, null);
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1200 }}>
      <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', width: '600px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e4e4e7', paddingBottom: '0.75rem' }}>
          <div>
            <h3 style={{ margin: '0 0 0.25rem 0' }}>Assign to {shift.shiftName}</h3>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
              <strong>Date:</strong> {shift.date} • <strong>Duration:</strong> {shift.durationHours}h • <strong>Current Staffing:</strong> {shift.currentAssignments.length} / {shift.minStaff}
            </div>
          </div>
          <button 
            onClick={onClose} 
            style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#94a3b8', lineHeight: 1 }}
          >
            &times;
          </button>
        </div>

        {/* Quick Search */}
        <input 
          type="text" 
          placeholder="🔍 Filter candidates by name..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }}
        />

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading candidates...</div>
        ) : (
          <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Volunteers Section */}
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#475569', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.025em' }}>
                Active Volunteers ({filteredVolunteers.length})
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {filteredVolunteers.map(v => {
                  const isAssignedToThisShift = shift.currentAssignments.some(a => a.volunteer?.id === v.id);
                  const hasApprovedTimeOff = timeOff.some(to => to.volunteerId === v.id && to.date === shift.date);
                  const isDisqualifiedForReception = isReceptionShift && !v.isReceptionQualified && v.primaryRole !== 'Reception';

                  return (
                    <div
                      key={v.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.6rem 0.75rem',
                        backgroundColor: isAssignedToThisShift ? '#f1f5f9' : '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: '600', color: '#1e293b' }}>{v.fullName}</span>
                        <CountryFlag countryCode={v.nationality} />

                        <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.4rem', borderRadius: '3px', backgroundColor: '#f1f5f9', color: '#475569' }}>
                          {v.primaryRole}
                        </span>

                        {v.isReceptionQualified && (
                          <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.35rem', borderRadius: '3px', backgroundColor: '#dbeafe', color: '#1e40af' }}>
                            ✓ Reception
                          </span>
                        )}

                        {v.isTrainer && (
                          <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.35rem', borderRadius: '3px', backgroundColor: '#dcfce7', color: '#166534' }}>
                            ✓ Trainer
                          </span>
                        )}

                        {v.inTraining && (
                          <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.35rem', borderRadius: '3px', backgroundColor: '#fef3c7', color: '#92400e' }}>
                            • Trainee
                          </span>
                        )}

                        {hasApprovedTimeOff && (
                          <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.35rem', borderRadius: '3px', backgroundColor: '#fee2e2', color: '#991b1b', fontWeight: 'bold' }}>
                            ⚠️ Time Off Approved
                          </span>
                        )}

                        {isDisqualifiedForReception && (
                          <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.35rem', borderRadius: '3px', backgroundColor: '#f3f4f6', color: '#6b7280' }}>
                            Not Reception Qualified
                          </span>
                        )}
                      </div>

                      <div>
                        {isAssignedToThisShift ? (
                          <span style={{ fontSize: '0.8rem', color: '#059669', fontWeight: '600' }}>✓ Assigned</span>
                        ) : isDisqualifiedForReception ? (
                          <button
                            disabled={true}
                            style={{
                              padding: '0.35rem 0.75rem',
                              background: '#e2e8f0',
                              color: '#94a3b8',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'not-allowed',
                              fontSize: '0.8rem',
                              fontWeight: '500'
                            }}
                            title="Volunteer is not reception qualified"
                          >
                            Not Qualified
                          </button>
                        ) : (
                          <button
                            onClick={() => handleVolunteerAssign(v, hasApprovedTimeOff)}
                            style={{
                              padding: '0.35rem 0.75rem',
                              background: hasApprovedTimeOff ? '#f59e0b' : '#3b82f6',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.8rem',
                              fontWeight: '500'
                            }}
                            title={hasApprovedTimeOff ? 'Approved time-off on this date - click to override' : undefined}
                          >
                            {hasApprovedTimeOff ? 'Override Assign' : 'Assign'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {filteredVolunteers.length === 0 && (
                  <div style={{ padding: '1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>No active volunteers available.</div>
                )}
              </div>
            </div>

            {/* Paid Staff Section (Available for Reception shifts or all shifts) */}
            {isReceptionShift && (
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#475569', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.025em' }}>
                  Permanent Paid Staff ({filteredStaff.length})
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {filteredStaff.map(s => {
                    const isAssigned = shift.currentAssignments.some(a => a.staff?.id === s.id);
                    return (
                      <div
                        key={s.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.6rem 0.75rem',
                          backgroundColor: isAssigned ? '#f1f5f9' : '#fff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px'
                        }}
                      >
                        <div>
                          <span style={{ fontWeight: '600', color: '#1e293b' }}>{s.fullName}</span>
                          <span style={{ fontSize: '0.8rem', color: '#64748b', marginLeft: '0.5rem' }}>({s.role || 'Staff'})</span>
                        </div>

                        <div>
                          {isAssigned ? (
                            <span style={{ fontSize: '0.8rem', color: '#059669', fontWeight: '600' }}>✓ Assigned</span>
                          ) : (
                            <button
                              onClick={() => onAssign(null, s.id)}
                              style={{
                                padding: '0.35rem 0.75rem',
                                background: '#10b981',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                fontWeight: '500'
                              }}
                            >
                              Assign Staff
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #e4e4e7', paddingTop: '0.75rem' }}>
          <button
            onClick={onClose}
            style={{ padding: '0.4rem 1rem', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
