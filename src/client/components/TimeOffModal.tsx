import React, { useState } from 'react';

interface TimeOffModalProps {
  onSubmit: (startDate: string, endDate: string, reason: string) => void;
  onClose: () => void;
}

export const TimeOffModal: React.FC<TimeOffModalProps> = ({ onSubmit, onClose }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  const computeDaysCount = () => {
    if (!startDate) return 0;
    const s = new Date(startDate).getTime();
    const e = endDate ? new Date(endDate).getTime() : s;
    if (s > e) return -1;
    return Math.round((e - s) / 86400000) + 1;
  };

  const daysCount = computeDaysCount();
  const isValid = daysCount > 0;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1200 }}>
      <div style={{ background: '#fff', padding: '1.75rem', borderRadius: '8px', width: '90%', maxWidth: '440px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{ margin: 0 }}>Request Time Off</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <label style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Start Date *</span>
              <input 
                type="date" 
                value={startDate} 
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (!endDate) setEndDate(e.target.value);
                }} 
                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #d4d4d8', width: '100%', boxSizing: 'border-box' }} 
              />
            </label>

            <label style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>End Date</span>
              <input 
                type="date" 
                value={endDate} 
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)} 
                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #d4d4d8', width: '100%', boxSizing: 'border-box' }} 
              />
            </label>
          </div>

          {/* Date count and summary preview */}
          {startDate && (
            <div style={{ padding: '0.6rem 0.75rem', borderRadius: '6px', backgroundColor: daysCount < 0 ? '#fee2e2' : '#f0fdf4', fontSize: '0.85rem', color: daysCount < 0 ? '#991b1b' : '#166534', fontWeight: '500' }}>
              {daysCount < 0 ? (
                '⚠️ End date cannot be before start date'
              ) : daysCount === 1 ? (
                `Requesting 1 day off (${startDate})`
              ) : (
                `Requesting ${daysCount} days off (${startDate} to ${endDate || startDate})`
              )}
            </div>
          )}
          
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Reason (Optional)</span>
            <textarea 
              value={reason} 
              onChange={(e) => setReason(e.target.value)} 
              placeholder="e.g. Island sightseeing trip, family visiting..."
              style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #d4d4d8', minHeight: '80px', fontFamily: 'inherit' }} 
            />
          </label>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button 
              type="button"
              onClick={onClose}
              style={{ padding: '0.5rem 1rem', background: 'transparent', border: '1px solid #d4d4d8', borderRadius: '4px', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button 
              type="button"
              onClick={() => { if (isValid) onSubmit(startDate, endDate || startDate, reason); }}
              disabled={!isValid}
              style={{ 
                padding: '0.5rem 1.25rem', 
                background: isValid ? '#3b82f6' : '#93c5fd', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: isValid ? 'pointer' : 'not-allowed',
                fontWeight: '500'
              }}
            >
              Submit Request
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
