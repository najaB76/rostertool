import React from 'react';
import { CountryFlag } from './CountryFlag';
import { formatDate } from '../utils/date-utils';

interface PrintableRosterViewProps {
  rosterDays: any[];
  weekStartDate: string;
  weekEndDate: string;
  onClose: () => void;
}

export const PrintableRosterView: React.FC<PrintableRosterViewProps> = ({
  rosterDays,
  weekStartDate,
  weekEndDate,
  onClose
}) => {
  const getFirstName = (fullName: string | undefined): string => {
    if (!fullName) return '';
    return fullName.trim().split(' ')[0];
  };

  const getDayFormatted = (dateStr: string) => {
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = String(d.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
  };

  const getDayName = (dateStr: string) => {
    return new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date(dateStr));
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.85)', zIndex: 1500, overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1.5rem 1rem' }}>
      {/* Top Action Bar */}
      <div style={{ width: '100%', maxWidth: '780px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', color: '#fff' }}>
        <button
          onClick={onClose}
          style={{ padding: '0.45rem 1rem', background: '#334155', color: '#fff', border: '1px solid #475569', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}
        >
          ← Back to Grid
        </button>

        <div style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>
          📸 <strong>Tip:</strong> Take a screenshot or press Print to save/share on WhatsApp
        </div>

        <button
          onClick={() => window.print()}
          style={{ padding: '0.45rem 1rem', background: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          🖨️ Print / Save PDF
        </button>
      </div>

      {/* Printable / Screenshot Card Container */}
      <div 
        id="whatsapp-roster-card"
        style={{
          width: '100%',
          maxWidth: '780px',
          background: '#fff',
          borderRadius: '4px',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
          overflow: 'hidden',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}
      >
        <table 
          style={{ 
            width: '100%', 
            borderCollapse: 'collapse', 
            textAlign: 'center', 
            border: '2px solid #000',
            tableLayout: 'fixed'
          }}
        >
          <colgroup>
            <col style={{ width: '18%' }} />
            <col style={{ width: '22%' }} />
            <col style={{ width: '22%' }} />
            <col style={{ width: '38%' }} />
          </colgroup>

          {/* Table Headers Matching WhatsApp Image */}
          <thead>
            <tr style={{ height: '56px' }}>
              <th style={{ background: '#000', border: '1px solid #000' }}></th>
              
              {/* Reception Day Header (Orange) */}
              <th style={{ background: '#f97316', color: '#000', border: '1px solid #000', padding: '0.5rem', verticalAlign: 'middle' }}>
                <div style={{ fontWeight: '800', fontSize: '1.05rem', lineHeight: '1.2' }}>Reception</div>
                <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>8am – 4pm</div>
              </th>

              {/* Night Shift Header (Blue) */}
              <th style={{ background: '#0284c7', color: '#fff', border: '1px solid #000', padding: '0.5rem', verticalAlign: 'middle' }}>
                <div style={{ fontWeight: '800', fontSize: '1.05rem', lineHeight: '1.2' }}>Night Shift</div>
                <div style={{ fontSize: '0.85rem', fontWeight: '500' }}>4pm – 12am</div>
              </th>

              {/* Housekeeping Header (Light Gray) */}
              <th style={{ background: '#cbd5e1', color: '#000', border: '1px solid #000', padding: '0.5rem', verticalAlign: 'middle' }}>
                <div style={{ fontWeight: '800', fontSize: '1.05rem', lineHeight: '1.2' }}>Housekeeping</div>
                <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>10am – 2pm</div>
              </th>
            </tr>
          </thead>

          <tbody>
            {rosterDays?.map((day) => {
              // Extract shifts
              const receptionDayShift = day.shifts.find((s: any) => 
                s.shiftDefinition.name.toLowerCase().includes('reception') && 
                !s.shiftDefinition.name.toLowerCase().includes('evening')
              );
              const receptionNightShift = day.shifts.find((s: any) => 
                s.shiftDefinition.name.toLowerCase().includes('evening')
              );
              const housekeepingShift = day.shifts.find((s: any) => 
                s.shiftDefinition.name.toLowerCase().includes('housekeeping')
              );

              const dayReceptionAssignee = receptionDayShift?.assignments?.[0];
              const nightReceptionAssignee = receptionNightShift?.assignments?.[0];
              const housekeepers = housekeepingShift?.assignments || [];

              return (
                <tr key={day.date} style={{ height: '68px', borderBottom: '1px solid #000' }}>
                  {/* Day Column */}
                  <td style={{ border: '1px solid #000', padding: '0.4rem', background: '#fff' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '1.05rem', color: '#0f172a' }}>
                      {getDayName(day.date)}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#475569', fontWeight: '500', marginTop: '2px' }}>
                      {getDayFormatted(day.date)}
                    </div>
                  </td>

                  {/* Reception Day Cell */}
                  <td style={{ border: '1px solid #000', padding: '0.4rem', background: '#fff' }}>
                    {dayReceptionAssignee ? (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: '600', fontSize: '1rem', color: '#0f172a' }}>
                        <span>{getFirstName(dayReceptionAssignee.volunteer?.fullName || dayReceptionAssignee.staff?.fullName)}</span>
                        <CountryFlag countryCode={dayReceptionAssignee.volunteer?.nationality || dayReceptionAssignee.staff?.nationality} style={{ fontSize: '1.2rem' }} />
                      </div>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>— Open —</span>
                    )}
                  </td>

                  {/* Reception Night Cell */}
                  <td style={{ border: '1px solid #000', padding: '0.4rem', background: '#fff' }}>
                    {nightReceptionAssignee ? (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: '600', fontSize: '1rem', color: '#0f172a' }}>
                        <span>{getFirstName(nightReceptionAssignee.volunteer?.fullName || nightReceptionAssignee.staff?.fullName)}</span>
                        <CountryFlag countryCode={nightReceptionAssignee.volunteer?.nationality || nightReceptionAssignee.staff?.nationality} style={{ fontSize: '1.2rem' }} />
                      </div>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>— Open —</span>
                    )}
                  </td>

                  {/* Housekeeping Grid Cell */}
                  <td style={{ border: '1px solid #000', padding: 0, background: '#fff', verticalAlign: 'middle' }}>
                    {housekeepers.length > 0 ? (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', width: '100%', height: '100%' }}>
                        {housekeepers.map((h: any, idx: number) => {
                          const name = getFirstName(h.volunteer?.fullName || h.staff?.fullName);
                          const country = h.volunteer?.nationality || h.staff?.nationality;
                          return (
                            <div 
                              key={idx}
                              style={{ 
                                padding: '0.35rem 0.4rem', 
                                borderRight: (idx % 2 === 0 && housekeepers.length > 1) ? '1px solid #cbd5e1' : 'none',
                                borderBottom: idx < housekeepers.length - 2 ? '1px solid #cbd5e1' : 'none',
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                gap: '0.35rem',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                color: '#0f172a'
                              }}
                            >
                              <span>{name}</span>
                              <CountryFlag countryCode={country} style={{ fontSize: '1.1rem' }} />
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>— Open —</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
