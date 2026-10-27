import React, { useState } from 'react';

interface TimeOffModalProps {
  onSubmit: (date: string, reason: string) => void;
  onClose: () => void;
}

export const TimeOffModal: React.FC<TimeOffModalProps> = ({ onSubmit, onClose }) => {
  const [date, setDate] = useState('');
  const [reason, setReason] = useState('');

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
      <div style={{ background: '#fff', padding: '2rem', borderRadius: '8px', width: '90%', maxWidth: '400px' }}>
        <h3 style={{ marginTop: 0 }}>Request Day Off</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span>Date</span>
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
              style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #d4d4d8' }} 
            />
          </label>
          
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span>Reason (Optional)</span>
            <textarea 
              value={reason} 
              onChange={(e) => setReason(e.target.value)} 
              style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #d4d4d8', minHeight: '80px' }} 
            />
          </label>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button 
              onClick={onClose}
              style={{ padding: '0.5rem 1rem', background: 'transparent', border: '1px solid #d4d4d8', borderRadius: '4px', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button 
              onClick={() => { if (date) onSubmit(date, reason); }}
              disabled={!date}
              style={{ padding: '0.5rem 1rem', background: date ? '#3b82f6' : '#93c5fd', color: '#fff', border: 'none', borderRadius: '4px', cursor: date ? 'pointer' : 'not-allowed' }}
            >
              Submit Request
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
