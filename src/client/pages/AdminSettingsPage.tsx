import React, { useEffect, useState } from 'react';

export const AdminSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState({
    housekeepersPerDay: 3,
    housekeepingShiftsPerWeek: 4,
    housekeepingStartTime: '10:00',
    housekeepingEndTime: '14:00'
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      setSettings(data);
    } catch (e: any) {
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const calculateHours = () => {
    const [sh, sm] = settings.housekeepingStartTime.split(':').map(Number);
    const [eh, em] = settings.housekeepingEndTime.split(':').map(Number);
    const diff = (eh * 60 + em - (sh * 60 + sm)) / 60;
    return diff > 0 ? diff : 0;
  };

  const shiftDuration = calculateHours();
  const targetWeeklyHours = shiftDuration * settings.housekeepingShiftsPerWeek;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update settings');
      setSettings(data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Error updating settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: '#71717a' }}>Loading settings...</div>;
  }

  return (
    <div style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ margin: '0 0 0.25rem 0' }}>Operational Settings</h2>
        <span style={{ fontSize: '0.85rem', color: '#71717a' }}>Configure default housekeeping requirements and shift rules for auto-scheduling.</span>
      </div>

      {success && (
        <div style={{ padding: '0.75rem 1rem', backgroundColor: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: '6px', color: '#166534', fontSize: '0.9rem', fontWeight: '500' }}>
          ✓ Operational settings updated and synchronized with shift definitions!
        </div>
      )}

      {error && (
        <div style={{ padding: '0.75rem 1rem', backgroundColor: '#fee2e2', border: '1px solid #fecaca', borderRadius: '6px', color: '#991b1b', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ background: '#fff', padding: '1.75rem', borderRadius: '8px', border: '1px solid #e4e4e7', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.05rem', color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
          🧹 Housekeeping Parameters
        </h3>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.875rem', fontWeight: '500', color: '#334155' }}>
          Number of housekeepers needed per day
          <input
            type="number"
            min="1"
            max="10"
            value={settings.housekeepersPerDay}
            onChange={(e) => setSettings({ ...settings, housekeepersPerDay: parseInt(e.target.value, 10) || 1 })}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
            required
          />
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Minimum housekeepers scheduled every day of the week (Default: 3)</span>
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.875rem', fontWeight: '500', color: '#334155' }}>
          Housekeeping shifts to assign per week (per volunteer)
          <input
            type="number"
            min="1"
            max="7"
            value={settings.housekeepingShiftsPerWeek}
            onChange={(e) => setSettings({ ...settings, housekeepingShiftsPerWeek: parseInt(e.target.value, 10) || 1 })}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
            required
          />
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Target housekeeping shifts per volunteer each week (Default: 4 shifts)</span>
        </label>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <label style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.875rem', fontWeight: '500', color: '#334155' }}>
            Shift Start Time
            <input
              type="time"
              value={settings.housekeepingStartTime}
              onChange={(e) => setSettings({ ...settings, housekeepingStartTime: e.target.value })}
              style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
              required
            />
          </label>

          <label style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.875rem', fontWeight: '500', color: '#334155' }}>
            Shift End Time
            <input
              type="time"
              value={settings.housekeepingEndTime}
              onChange={(e) => setSettings({ ...settings, housekeepingEndTime: e.target.value })}
              style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
              required
            />
          </label>
        </div>

        {/* Dynamic calculation banner */}
        <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.85rem', color: '#475569' }}>
          ℹ️ <strong>Calculated Workload:</strong> {shiftDuration.toFixed(1)} hours per shift • <strong>{targetWeeklyHours.toFixed(1)} target weekly hours</strong> per volunteer ({settings.housekeepingShiftsPerWeek} shifts × {shiftDuration.toFixed(1)}h).
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: '0.6rem 1.5rem',
              backgroundColor: '#3b82f6',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontWeight: '600',
              cursor: saving ? 'not-allowed' : 'pointer'
            }}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};
