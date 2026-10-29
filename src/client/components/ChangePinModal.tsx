import React, { useState } from 'react';

interface ChangePinModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangePinModal: React.FC<ChangePinModalProps> = ({ isOpen, onClose }) => {
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPin !== confirmPin) {
      setError('New PIN and Confirm PIN do not match');
      return;
    }

    if (newPin.trim().length < 4) {
      setError('New PIN must be at least 4 digits');
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('admin_token');

    try {
      const res = await fetch('/api/auth/change-pin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPin, newPin })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to change PIN');
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setCurrentPin('');
        setNewPin('');
        setConfirmPin('');
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Error updating PIN');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1300 }}>
      <div style={{ background: '#fff', padding: '1.75rem', borderRadius: '8px', width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a' }}>Change Your PIN</h3>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#94a3b8' }}
          >
            &times;
          </button>
        </div>

        {error && (
          <div style={{ padding: '0.6rem 0.75rem', backgroundColor: '#fee2e2', border: '1px solid #fecaca', borderRadius: '4px', color: '#991b1b', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ padding: '0.6rem 0.75rem', backgroundColor: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: '4px', color: '#166534', fontSize: '0.85rem' }}>
            ✓ PIN updated successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.85rem', fontWeight: '500', color: '#334155' }}>
            Current PIN
            <input
              type="password"
              inputMode="numeric"
              value={currentPin}
              onChange={(e) => setCurrentPin(e.target.value)}
              placeholder="Enter current PIN"
              required
              autoFocus
              style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.85rem', fontWeight: '500', color: '#334155' }}>
            New PIN (min 4 digits)
            <input
              type="password"
              inputMode="numeric"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              placeholder="Enter new PIN"
              required
              style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.85rem', fontWeight: '500', color: '#334155' }}>
            Confirm New PIN
            <input
              type="password"
              inputMode="numeric"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
              placeholder="Confirm new PIN"
              required
              style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
            />
          </label>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: '0.45rem 1rem', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || success}
              style={{ padding: '0.45rem 1.25rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '500', fontSize: '0.85rem' }}
            >
              {loading ? 'Saving...' : 'Update PIN'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
