import React, { useEffect, useState } from 'react';
import { VolunteerModal } from '../components/VolunteerModal.js';
import { CountryFlag } from '../components/CountryFlag.js';

export const AdminVolunteersPage: React.FC = () => {
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [filter, setFilter] = useState('Active');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVol, setSelectedVol] = useState<any>(null);

  const fetchVolunteers = async () => {
    const res = await fetch(`/api/admin/volunteers?status=${filter}`);
    const data = await res.json();
    setVolunteers(data);
  };

  useEffect(() => {
    fetchVolunteers();
  }, [filter]);

  const handleSave = async (data: any) => {
    const method = selectedVol ? 'PUT' : 'POST';
    const url = selectedVol ? `/api/admin/volunteers/${selectedVol.id}` : '/api/admin/volunteers';
    
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    setIsModalOpen(false);
    fetchVolunteers();
  };

  const handleDepart = async (id: string) => {
    const rating = prompt('Enter rating (1-5):', '5');
    if (!rating) return;
    
    await fetch(`/api/admin/volunteers/${id}/depart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rating: parseInt(rating, 10),
        reviewNotes: 'Departed via UI',
        futureAcceptanceRecommendation: 'Accept'
      })
    });
    fetchVolunteers();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Volunteers</h2>
        <button 
          onClick={() => { setSelectedVol(null); setIsModalOpen(true); }}
          style={{ padding: '0.5rem 1rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          + New Application
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #e4e4e7', paddingBottom: '0.5rem' }}>
        {['Applied', 'Accepted', 'Active', 'Departed', 'Cancelled'].map(s => (
          <button 
            key={s} 
            onClick={() => setFilter(s)}
            style={{ 
              background: 'none', 
              border: 'none', 
              fontWeight: filter === s ? 'bold' : 'normal',
              color: filter === s ? '#3b82f6' : '#52525b',
              cursor: 'pointer'
            }}
          >
            {s}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {volunteers.map(v => (
          <div key={v.id} style={{ background: '#fff', padding: '1rem', borderRadius: '8px', border: '1px solid #e4e4e7', display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>
                {v.fullName} <CountryFlag countryCode={v.nationality} />
              </h3>
              <div style={{ fontSize: '0.85rem', color: '#71717a', display: 'flex', gap: '1rem' }}>
                <span>Role: {v.primaryRole}</span>
                <span>Source: {v.applicationSourceName}</span>
                <span>Dates: {v.arrivalDate || 'TBD'} to {v.departureDate || 'TBD'}</span>
                {v.status === 'Departed' && <span>Re-hire: {v.futureAcceptance}</span>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <button onClick={() => { setSelectedVol(v); setIsModalOpen(true); }}>Edit</button>
              {(v.status === 'Active' || v.status === 'Accepted') && (
                <button onClick={() => handleDepart(v.id)} style={{ color: '#ef4444' }}>Depart</button>
              )}
            </div>
          </div>
        ))}
        
        {volunteers.length === 0 && <div style={{ color: '#a1a1aa' }}>No volunteers found in this status.</div>}
      </div>

      {isModalOpen && (
        <VolunteerModal 
          volunteer={selectedVol} 
          onSave={handleSave} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </div>
  );
};
