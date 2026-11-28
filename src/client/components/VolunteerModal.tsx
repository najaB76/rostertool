import React, { useState, useEffect } from 'react';
import { CountrySelect } from './CountrySelect';
import { ImageLightboxModal } from './ImageLightboxModal';

interface VolunteerModalProps {
  volunteer?: any;
  onSave: (data: any) => void;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

export const VolunteerModal: React.FC<VolunteerModalProps> = ({ volunteer, onSave, onClose, onDelete }) => {
  const [formData, setFormData] = useState({
    fullName: volunteer?.fullName || '',
    preferredName: volunteer?.preferredName || '',
    dateOfBirth: volunteer?.dateOfBirth || '',
    email: volunteer?.email || '',
    phone: volunteer?.phone || '',
    nationality: volunteer?.nationality || '',
    gender: volunteer?.gender || 'Unspecified',
    noEndDate: volunteer?.noEndDate || false,
    applicationSourceName: volunteer?.applicationSourceName || volunteer?.source || 'WorkAway',
    arrivalDate: volunteer?.arrivalDate || '',
    departureDate: volunteer?.departureDate || '',
    primaryRole: volunteer?.primaryRole || 'Housekeeping',
    isReceptionQualified: volunteer?.isReceptionQualified || false,
    isTrainer: volunteer?.isTrainer || false,
    inTraining: volunteer?.inTraining || false,
    status: volunteer?.status || 'Applied',
    profilePicture: volunteer?.profilePicture || null,
    notes: volunteer?.notes || ''
  });

  const [sources, setSources] = useState<string[]>(['HelpEx', 'WorkAway', 'Worldpackers', 'Guest']);
  const [isCustomSource, setIsCustomSource] = useState(false);
  const [capacityPreview, setCapacityPreview] = useState<any[]>([]);
  const [modalSize, setModalSize] = useState<{ width: number; height: number }>({ width: 560, height: 640 });
  const [isResizing, setIsResizing] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showLightbox) {
          setShowLightbox(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, showLightbox]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const maxDim = 800;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setFormData(prev => ({ ...prev, profilePicture: compressedDataUrl }));
        } else {
          setFormData(prev => ({ ...prev, profilePicture: dataUrl }));
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setFormData(prev => ({ ...prev, profilePicture: null }));
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = modalSize.width;
    const startHeight = modalSize.height;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      const newWidth = Math.min(
        Math.max(startWidth + deltaX, 480),
        window.innerWidth * 0.95
      );
      const newHeight = Math.min(
        Math.max(startHeight + deltaY, 400),
        window.innerHeight * 0.95
      );

      setModalSize({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

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
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, userSelect: isResizing ? 'none' : 'auto' }}>
      <div style={{ position: 'relative', background: '#fff', padding: '2rem', borderRadius: '8px', width: `${modalSize.width}px`, height: `${modalSize.height}px`, minWidth: '480px', maxWidth: '95vw', minHeight: '400px', maxHeight: '95vh', overflow: 'auto', boxSizing: 'border-box', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)' }}>
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

          <div className="preferred-name-photo-row">
            <div className="preferred-name-field">
              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
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
            </div>

            <div className="profile-photo-wrapper">
              <span className="profile-photo-label">Photo</span>
              {formData.profilePicture ? (
                <div className="profile-thumbnail-container">
                  <img
                    src={formData.profilePicture}
                    alt={formData.preferredName || formData.fullName || 'Volunteer'}
                    className="profile-thumbnail clickable"
                    onClick={() => setShowLightbox(true)}
                    title="Click to view full picture"
                  />
                  <div className="photo-actions">
                    <label className="photo-change-btn" title="Change photo">
                      ✎
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        style={{ display: 'none' }}
                      />
                    </label>
                    <button
                      type="button"
                      className="photo-remove-btn"
                      onClick={handleRemovePhoto}
                      title="Remove photo"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ) : (
                <label className="photo-upload-placeholder" title="Upload profile photo">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    style={{ display: 'none' }}
                  />
                  <span className="upload-icon">📷</span>
                  <span className="upload-text">Upload</span>
                </label>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
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

            <label style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <strong>Gender</strong>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d4d4d8', backgroundColor: '#fff', boxSizing: 'border-box' }}
              >
                <option value="Unspecified">⚪ Unspecified</option>
                <option value="Male">♂ Male</option>
                <option value="Female">♀ Female</option>
                <option value="Neutral">⚧ Neutral</option>
              </select>
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
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d4d4d8', boxSizing: 'border-box' }} 
              />
            </label>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>Departure Date</strong>
                <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    name="noEndDate" 
                    checked={formData.noEndDate} 
                    onChange={handleChange} 
                  />
                  No end date
                </label>
              </div>
              <input 
                type="date" 
                name="departureDate" 
                value={formData.noEndDate ? '' : formData.departureDate} 
                disabled={formData.noEndDate}
                onChange={handleChange} 
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d4d4d8', backgroundColor: formData.noEndDate ? '#f4f4f5' : '#fff', cursor: formData.noEndDate ? 'not-allowed' : 'text', boxSizing: 'border-box' }} 
              />
            </div>
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
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
            {volunteer?.id && onDelete ? (
              <button
                type="button"
                className="btn-danger"
                onClick={() => {
                  if (window.confirm(`Are you sure you want to permanently delete ${volunteer.fullName || 'this volunteer'}?\n\nThis will remove all their records, stays, and shift assignments.`)) {
                    onDelete(volunteer.id);
                  }
                }}
                style={{ padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}
              >
                🗑 Delete Volunteer
              </button>
            ) : <span />}

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                type="button" 
                className="btn-cancel"
                onClick={onClose}
                style={{ padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn-primary"
                onClick={() => onSave({ ...formData, source: formData.applicationSourceName })} 
                style={{ padding: '0.5rem 1.25rem', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}
              >
                Save Volunteer
              </button>
            </div>
          </div>
        </div>

        {/* Interactive Corner Resize Grip Handle */}
        <div
          onMouseDown={handleResizeMouseDown}
          style={{
            position: 'absolute',
            bottom: '3px',
            right: '3px',
            width: '18px',
            height: '18px',
            cursor: 'nwse-resize',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#94a3b8',
            fontSize: '11px',
            userSelect: 'none',
            zIndex: 10
          }}
          title="Click and drag to resize modal"
        >
          ◢
        </div>
      </div>

      {showLightbox && (
        <ImageLightboxModal
          imageUrl={formData.profilePicture}
          volunteerName={formData.preferredName || formData.fullName}
          onClose={() => setShowLightbox(false)}
        />
      )}
    </div>
  );
};
