import React from 'react';

interface HeadcountDay {
  date: string;
  count: number;
  status: 'OPTIMAL' | 'LOW_WARNING' | 'OVERLAP_WARNING' | 'CRITICAL_LOW' | 'CRITICAL_HIGH';
}

interface HeadcountCalendarProps {
  days: HeadcountDay[];
}

export const HeadcountCalendar: React.FC<HeadcountCalendarProps> = ({ days }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CRITICAL_LOW':
      case 'CRITICAL_HIGH': return '#fecaca'; // Red
      case 'LOW_WARNING': return '#fed7aa'; // Amber
      case 'OVERLAP_WARNING': return '#fef08a'; // Yellow
      case 'OPTIMAL': return '#bbf7d0'; // Green
      default: return '#e4e4e7';
    }
  };

  const getStatusBorder = (status: string) => {
    switch (status) {
      case 'CRITICAL_LOW':
      case 'CRITICAL_HIGH': return '#ef4444'; 
      case 'LOW_WARNING': return '#f97316'; 
      case 'OVERLAP_WARNING': return '#eab308'; 
      case 'OPTIMAL': return '#22c55e'; 
      default: return '#a1a1aa';
    }
  };

  if (!days || days.length === 0) return <div>No data available.</div>;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem' }}>
      {days.map(d => (
        <div 
          key={d.date} 
          style={{ 
            border: `2px solid ${getStatusBorder(d.status)}`, 
            backgroundColor: getStatusColor(d.status),
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}
        >
          <div style={{ fontSize: '0.85rem', color: '#52525b', fontWeight: 'bold' }}>{d.date}</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#18181b' }}>{d.count}</div>
          <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: getStatusBorder(d.status) }}>
            {d.status.replace('_', ' ')}
          </div>
        </div>
      ))}
    </div>
  );
};
