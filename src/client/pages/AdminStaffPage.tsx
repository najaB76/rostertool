import React, { useEffect, useState } from 'react';
import { CountryFlag } from '../components/CountryFlag';
import { CountrySelect } from '../components/CountrySelect';

export const AdminStaffPage: React.FC = () => {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    nationality: 'ES',
    role: 'Receptionist',
    contactInfo: ''
  });

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/staff');
      const data = await res.json();
      setStaff(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleOpenAdd = () => {
    setEditingStaff(null);
    setFormData({
      fullName: '',
      nationality: 'ES',
      role: 'Receptionist',
      contactInfo: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: any) => {
    setEditingStaff(s);
    setFormData({
      fullName: s.fullName || '',
      nationality: s.nationality || 'ES',
      role: s.role || 'Receptionist',
      contactInfo: s.contactInfo || ''
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      alert('Full name is required');
      return;
    }

    try {
      if (editingStaff) {
        await fetch(`/api/admin/staff/${editingStaff.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } else {
        await fetch('/api/admin/staff', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }
      setIsModalOpen(false);
      fetchStaff();
    } catch (err) {
      console.error(err);
      alert('Failed to save staff member');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove staff member "${name}"?`)) {
      try {
        await fetch(`/api/admin/staff/${id}`, { method: 'DELETE' });
        fetchStaff();
      } catch (err) {
        console.error(err);
        alert('Failed to delete staff member');
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: '0 0 0.25rem 0' }}>Staff Management</h2>
          <span style={{ fontSize: '0.85rem', color: '#71717a' }}>Manage permanent and paid staff members for reception and management roles.</span>
        </div>
        <button
          onClick={handleOpenAdd}
          style={{ padding: '0.5rem 1rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}
        >
          + Add Staff Member
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#71717a' }}>Loading staff...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {staff.map(s => (
            <div
              key={s.id}
              style={{
                background: '#fff',
                padding: '1.25rem',
                borderRadius: '8px',
                border: '1px solid #e4e4e7',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '1.05rem', color: '#1e293b' }}>{s.fullName}</span>
                  <CountryFlag countryCode={s.nationality} />
                  <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '4px', backgroundColor: '#dbeafe', color: '#1e40af', fontWeight: '600' }}>
                    {s.role}
                  </span>
                </div>
                {s.contactInfo && (
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    📞 {s.contactInfo}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => handleOpenEdit(s)}
                  style={{ padding: '0.35rem 0.75rem', background: '#f4f4f5', border: '1px solid #d4d4d8', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(s.id, s.fullName)}
                  style={{ padding: '0.35rem 0.75rem', background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          {staff.length === 0 && (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8', background: '#fff', borderRadius: '8px', border: '1px solid #e4e4e7' }}>
              No staff members found. Click "+ Add Staff Member" to create one.
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Staff Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1200 }}>
          <form onSubmit={handleSave} style={{ background: '#fff', padding: '1.75rem', borderRadius: '8px', width: '450px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ margin: 0 }}>{editingStaff ? 'Edit Staff Member' : 'Add Staff Member'}</h3>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <strong>Full Name *</strong>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="e.g. Hervé Blanc"
                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #d4d4d8' }}
                required
              />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <strong>Nationality *</strong>
              <CountrySelect
                value={formData.nationality}
                onChange={(code) => setFormData({ ...formData, nationality: code })}
              />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <strong>Role *</strong>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #d4d4d8' }}
              >
                <option value="Receptionist">Receptionist</option>
                <option value="Senior Receptionist">Senior Receptionist</option>
                <option value="Hostel Manager">Hostel Manager</option>
                <option value="Shift Supervisor">Shift Supervisor</option>
                <option value="General Staff">General Staff</option>
              </select>
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <strong>Contact Info (Optional)</strong>
              <input
                type="text"
                value={formData.contactInfo}
                onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                placeholder="e.g. +34 600 000 000"
                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #d4d4d8' }}
              />
            </label>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ padding: '0.5rem 1rem', background: '#f4f4f5', border: '1px solid #d4d4d8', borderRadius: '4px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{ padding: '0.5rem 1.25rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}
              >
                {editingStaff ? 'Save Changes' : 'Create Staff Member'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
