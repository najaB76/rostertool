import React, { useState, useEffect } from 'react';
import { CountrySelect } from './CountrySelect';

interface VolunteerModalProps {
  volunteer?: any;
  onSave: (data: any) => void;
  onClose: () => void;
}

export const VolunteerModal: React.FC<VolunteerModalProps> = ({ volunteer, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    fullName: volunteer?.fullName || '',
    preferredName: volunteer?.preferredName || '',
    dateOfBirth: volunteer?.dateOfBirth || '',
    email: volunteer?.email || '',
    phone: volunteer?.phone || '',
    nationality: volunteer?.nationality || '',
    applicationSourceName: volunteer?.applicationSourceName || 'WorkAway',
    arrivalDate: volunteer?.arrivalDate || '',
    departureDate: volunteer?.departureDate || '',
    primaryRole: volunteer?.primaryRole || 'Housekeeping',
    isReceptionQualified: volunteer?.isReceptionQualified || false,
    isTrainer: volunteer?.isTrainer || false,
    inTraining: volunteer?.inTraining || false,
    status: volunteer?.status || 'Applied',
    notes: volunteer?.notes || ''
  });

  const [sources, setSources] = useState<string[]>(['HelpEx', 'WorkAway', 'Worldpackers', 'Guest']);
  const [isCustomSource, setIsCustomSource] = useState(false);
  const [capacityPreview, setCapacityPreview] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/admin/volunteers/sources')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const names = Array.from(new Set([...sources, ...data.map((s: any) => s.name)]));
          setSources(names);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (formData.arrivalDate && formData.departureDate) {
      fetch(`/api/admin/headcount?startDate=${formData.arrivalDate}&endDate=${formData.departureDate}`)
        .then(res => res.json())
        .then(data => {
          const preview = data.map((d: any) => {
            const isExisting = d.volunteers?.some((v: any) => v.id === volunteer?.id);
            const previewCount = isExisting ? d.count : d.count + 1;
            let status = 'OPTIMAL';
            if (previewCount < 10) status = 'CRITICAL_LOW';
            else if (previewCount >= 10 && previewCount <= 11) status = 'LOW_WARNING';
            else if (previewCount >= 13 && previewCount <= 15) status = 'OVERLAP_WARNING';
            else if (previewCount > 15) status = 'CRITICAL_HIGH';
            return { date: d.date, count: previewCount, status };
          });
          setCapacityPreview(preview);
        }).catch(e => console.error(e));
    } else {
      setCapacityPreview([]);
    }
  }, [formData.arrivalDate, formData.departureDate, volunteer?.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const hasCapacityWarnings = capacityPreview.some(d => d.status !== 'OPTIMAL');

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div style={{ background: '#fff', padding: '2rem', borderRadius: '8px', width: '520px', maxHeight: '90vh', overflowY: 'auto' }}>
        <h3 style={{ marginTop: 0 }}>{volunteer ? `Edit Volunteer (${formData.status})` : 'New Volunteer Application'}</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <strong>Full Name (Official) *</strong>
            <input 
              type="text" 
              name="fullName" 
              value={formData.fullName} 
              onChange={handleChange} 
              placeholder="e.g. Maria Silva"
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d4d4d8' }} 
              required
            />
          </label>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <label style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <strong>Preferred Name (Optional)</strong>
              <input 
                type="text" 
                name="preferredName" 
                value={formData.preferredName} 
                onChange={handleChange} 
                placeholder="e.g. Mari"
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d4d4d8', boxSizing: 'border-box' }} 
              />
            </label>

            <label style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <strong>Date of Birth</strong>
              <input 
                type="date" 
                name="dateOfBirth" 
                value={formData.dateOfBirth} 
                onChange={handleChange} 
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d4d4d8', boxSizing: 'border-box' }} 
              />
            </label>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <label style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <strong>Email Address</strong>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                placeholder="e.g. maria@example.com"
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d4d4d8', boxSizing: 'border-box' }} 
              />
            </label>

            <label style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <strong>Phone / WhatsApp</strong>
              <input 
                type="tel" 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange} 
                placeholder="e.g. +55 11 98765-4321"
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d4d4d8', boxSizing: 'border-box' }} 
              />
            </label>
          </div>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <strong>Nationality</strong>
            <CountrySelect 
              value={formData.nationality} 
              onChange={(code) => setFormData(prev => ({ ...prev, nationality: code }))} 
            />
          </label>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <strong>Application Source</strong>
            {!isCustomSource ? (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <select
                  name="applicationSourceName"
                  value={formData.applicationSourceName}
                  onChange={handleChange}
                  style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid #d4d4d8', backgroundColor: '#fff' }}
                >
                  {sources.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setIsCustomSource(true)}
                  style={{ padding: '0.5rem', border: '1px solid #d4d4d8', borderRadius: '4px', background: '#f4f4f5', cursor: 'pointer', fontSize: '0.8rem' }}
                >
                  + Other
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  name="applicationSourceName"
                  value={formData.applicationSourceName}
                  onChange={handleChange}
                  placeholder="Enter custom source..."
                  style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid #d4d4d8' }}
                />
                <button
                  type="button"
                  onClick={() => setIsCustomSource(false)}
                  style={{ padding: '0.5rem', border: '1px solid #d4d4d8', borderRadius: '4px', background: '#f4f4f5', cursor: 'pointer', fontSize: '0.8rem' }}
                >
                  Choose list
                </button>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <label style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <strong>Arrival Date</strong>
              <input 
                type="date" 
                name="arrivalDate" 
                value={formData.arrivalDate} 
                onChange={handleChange} 
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d4d4d8' }} 
              />
            </label>
            <label style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <strong>Departure Date</strong>
              <input 
                type="date" 
                name="departureDate" 
                value={formData.departureDate} 
                onChange={handleChange} 
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d4d4d8' }} 
              />
            </label>
          </div>

          {capacityPreview.length > 0 && (
            <div style={{ padding: '0.75rem', background: '#f4f4f5', borderRadius: '6px', fontSize: '0.85rem' }}>
              <strong>Capacity Impact Preview:</strong>
              {hasCapacityWarnings ? (
                <div style={{ color: '#ef4444', marginTop: '0.25rem', fontWeight: '500' }}>
                  ⚠️ Notice: Proposed dates trigger capacity alert (Peak count: {Math.max(...capacityPreview.map(d => d.count))} volunteers).
                </div>
              ) : (
                <div style={{ color: '#10b981', marginTop: '0.25rem' }}>
                  ✓ Capacity stays within nominal baseline (Target: 12 volunteers).
                </div>
              )}
            </div>
          )}

          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <strong>Primary Role</strong>
            <select 
              name="primaryRole" 
              value={formData.primaryRole} 
              onChange={handleChange} 
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d4d4d8', backgroundColor: '#fff' }}
            >
              <option value="Housekeeping">Housekeeping (16h standard)</option>
              <option value="Reception">Reception (16h standard)</option>
            </select>
          </label>

          <div style={{ display: 'flex', gap: '1.25rem', padding: '0.5rem 0' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', fontSize: '0.9rem' }}>
              <input type="checkbox" name="isReceptionQualified" checked={formData.isReceptionQualified} onChange={handleChange} />
              Reception Qualified
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', fontSize: '0.9rem' }}>
              <input type="checkbox" name="isTrainer" checked={formData.isTrainer} onChange={handleChange} />
              Is Trainer
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', fontSize: '0.9rem' }}>
              <input type="checkbox" name="inTraining" checked={formData.inTraining} onChange={handleChange} />
              In Training
            </label>
          </div>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <strong>Notes & Comments (Editable at all times)</strong>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Application history, interview remarks, on-stay feedback, or notes..."
              style={{ width: '100%', minHeight: '80px', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d4d4d8', fontFamily: 'inherit' }}
            />
          </label>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button 
              type="button" 
              onClick={onClose}
              style={{ padding: '0.5rem 1rem', background: '#fff', border: '1px solid #d4d4d8', borderRadius: '4px', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button 
              type="button" 
              onClick={() => onSave(formData)} 
              style={{ background: '#3b82f6', color: '#fff', padding: '0.5rem 1.25rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}
            >
              Save Volunteer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
