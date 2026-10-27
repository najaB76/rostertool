import React, { useState, useEffect } from 'react';

interface VolunteerModalProps {
  volunteer?: any;
  onSave: (data: any) => void;
  onClose: () => void;
}

export const VolunteerModal: React.FC<VolunteerModalProps> = ({ volunteer, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    fullName: volunteer?.fullName || '',
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

  const [capacityPreview, setCapacityPreview] = useState<any[]>([]);

  useEffect(() => {
    if (formData.arrivalDate && formData.departureDate) {
      fetch(`/api/admin/headcount?startDate=${formData.arrivalDate}&endDate=${formData.departureDate}`)
        .then(res => res.json())
        .then(data => {
          // If this is a new volunteer, or changing dates, we add 1 to the count for the preview
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
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ background: '#fff', padding: '2rem', borderRadius: '8px', width: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
        <h3>{volunteer ? 'Edit Volunteer' : 'New Volunteer Application'}</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <label>Full Name
            <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} style={{ width: '100%' }} />
          </label>
          <label>Nationality (ISO-2)
            <input type="text" name="nationality" value={formData.nationality} onChange={handleChange} style={{ width: '100%' }} />
          </label>
          <label>Source
            <input type="text" name="applicationSourceName" value={formData.applicationSourceName} onChange={handleChange} style={{ width: '100%' }} />
          </label>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <label style={{ flex: 1 }}>Arrival Date
              <input type="date" name="arrivalDate" value={formData.arrivalDate} onChange={handleChange} style={{ width: '100%' }} />
            </label>
            <label style={{ flex: 1 }}>Departure Date
              <input type="date" name="departureDate" value={formData.departureDate} onChange={handleChange} style={{ width: '100%' }} />
            </label>
          </div>

          {capacityPreview.length > 0 && (
            <div style={{ padding: '0.5rem', background: '#f4f4f5', borderRadius: '4px', fontSize: '0.85rem' }}>
              <strong>Capacity Impact Preview:</strong>
              {hasCapacityWarnings ? (
                <div style={{ color: '#ef4444', marginTop: '0.25rem' }}>Warning: Proposed dates trigger capacity alerts (Headcount will be {Math.max(...capacityPreview.map(d => d.count))})</div>
              ) : (
                <div style={{ color: '#10b981', marginTop: '0.25rem' }}>Capacity remains optimal (Target ~12).</div>
              )}
            </div>
          )}

          <label>Primary Role
            <select name="primaryRole" value={formData.primaryRole} onChange={handleChange} style={{ width: '100%' }}>
              <option value="Housekeeping">Housekeeping</option>
              <option value="Reception">Reception</option>
            </select>
          </label>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <label>
              <input type="checkbox" name="isReceptionQualified" checked={formData.isReceptionQualified} onChange={handleChange} />
              Reception Qualified
            </label>
            <label>
              <input type="checkbox" name="isTrainer" checked={formData.isTrainer} onChange={handleChange} />
              Is Trainer
            </label>
            <label>
              <input type="checkbox" name="inTraining" checked={formData.inTraining} onChange={handleChange} />
              In Training
            </label>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button onClick={onClose}>Cancel</button>
            <button onClick={() => onSave(formData)} style={{ background: '#3b82f6', color: '#fff', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px' }}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
};
