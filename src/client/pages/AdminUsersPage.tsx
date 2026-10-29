import React, { useEffect, useState } from 'react';
import { formatDate } from '../utils/date-utils';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  const [formData, setFormData] = useState({
    username: '',
    pin: ''
  });
  const [error, setError] = useState<string | null>(null);

  const currentUsername = localStorage.getItem('admin_username') || '';

  const fetchUsers = async () => {
    setLoading(true);
    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({ username: '', pin: '' });
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: any) => {
    setEditingUser(user);
    setFormData({ username: user.username, pin: '' });
    setError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.username.trim()) {
      setError('Username is required');
      return;
    }

    if (!editingUser && (!formData.pin || formData.pin.trim().length < 4)) {
      setError('PIN must be at least 4 digits');
      return;
    }

    const token = localStorage.getItem('admin_token');

    try {
      if (editingUser) {
        const payload: any = { username: formData.username.trim() };
        if (formData.pin.trim()) payload.pin = formData.pin.trim();

        const res = await fetch(`/api/admin/users/${editingUser.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update user');
      } else {
        const res = await fetch('/api/admin/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to create user');
      }

      setIsModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Error saving admin user');
    }
  };

  const handleDelete = async (id: string, username: string) => {
    if (window.confirm(`Are you sure you want to remove administrator "${username}"?`)) {
      const token = localStorage.getItem('admin_token');
      try {
        const res = await fetch(`/api/admin/users/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to delete user');
        fetchUsers();
      } catch (err: any) {
        alert(err.message || 'Failed to delete admin user');
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: '0 0 0.25rem 0' }}>Admin Users</h2>
          <span style={{ fontSize: '0.85rem', color: '#71717a' }}>Manage administrator accounts with login access to this system.</span>
        </div>
        <button
          onClick={handleOpenAdd}
          style={{ padding: '0.5rem 1rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}
        >
          + Add Admin User
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#71717a' }}>Loading admin users...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {users.map(u => {
            const isSelf = u.username.toLowerCase() === currentUsername.toLowerCase();
            return (
              <div
                key={u.id}
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '1.05rem', color: '#1e293b' }}>👤 {u.username}</span>
                    {isSelf && (
                      <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '4px', backgroundColor: '#dcfce7', color: '#166534', fontWeight: '600' }}>
                        (You)
                      </span>
                    )}
                  </div>
                  {u.createdAt && (
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                      Created: {formatDate(u.createdAt)}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleOpenEdit(u)}
                    style={{ padding: '0.35rem 0.75rem', background: '#f4f4f5', border: '1px solid #d4d4d8', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                  >
                    Edit / Reset PIN
                  </button>
                  {!isSelf && users.length > 1 && (
                    <button
                      onClick={() => handleDelete(u.id, u.username)}
                      style={{ padding: '0.35rem 0.75rem', background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Admin User Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1200 }}>
          <form onSubmit={handleSave} style={{ background: '#fff', padding: '1.75rem', borderRadius: '8px', width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ margin: 0 }}>{editingUser ? 'Edit Admin User' : 'Add Admin User'}</h3>

            {error && (
              <div style={{ padding: '0.6rem 0.75rem', backgroundColor: '#fee2e2', border: '1px solid #fecaca', borderRadius: '4px', color: '#991b1b', fontSize: '0.85rem' }}>
                {error}
              </div>
            )}

            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.85rem', fontWeight: '500' }}>
              Username *
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="e.g. manager_sarah"
                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #d4d4d8' }}
                required
              />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.85rem', fontWeight: '500' }}>
              {editingUser ? 'Reset PIN (leave blank to keep current)' : 'Security PIN (min 4 digits) *'}
              <input
                type="password"
                inputMode="numeric"
                value={formData.pin}
                onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
                placeholder={editingUser ? 'Leave blank to keep current' : 'e.g. 5678'}
                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #d4d4d8' }}
                required={!editingUser}
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
                {editingUser ? 'Save Changes' : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
