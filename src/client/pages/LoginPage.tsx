import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('admin');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/admin/roster';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, pin })
      });

      const data = await res.json();
      if (!res.ok || !data.token) {
        throw new Error(data.error || 'Invalid Username or PIN');
      }

      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('admin_username', data.username);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: '380px', backgroundColor: '#fff', padding: '2rem', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', color: '#0f172a' }}>🏨 Hostel Manager</h1>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>Enter your username and PIN to continue</p>
        </div>

        {error && (
          <div style={{ padding: '0.75rem', marginBottom: '1rem', backgroundColor: '#fee2e2', border: '1px solid #fecaca', borderRadius: '4px', color: '#991b1b', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.875rem', fontWeight: '500', color: '#334155' }}>
            Username
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              required
              style={{ padding: '0.6rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.875rem', fontWeight: '500', color: '#334155' }}>
            Security PIN
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="e.g. 1234"
              required
              autoFocus
              style={{ padding: '0.6rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '0.7rem',
              backgroundColor: '#3b82f6',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '0.5rem'
            }}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8' }}>
          Default PIN is <code>1234</code>
        </div>
      </div>
    </div>
  );
};
