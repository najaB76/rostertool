import React, { useEffect, useState } from 'react';

export const AdminSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState({
    housekeepersPerDay: 3,
    housekeepingShiftsPerWeek: 4,
    housekeepingStartTime: '10:00',
    housekeepingEndTime: '14:00',
    headcountBaseline: 11,
    headcountLowMin: 8,
    headcountLowMax: 10,
    headcountCritical: 8,
    headcountOverbooked: 11,
    dateFormatPreference: 'YYYY-MM-DD'
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
    const [sh, sm] = (settings.housekeepingStartTime || '10:00').split(':').map(Number);
    const [eh, em] = (settings.housekeepingEndTime || '14:00').split(':').map(Number);
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

  const handleDownloadBackup = () => {
    window.location.href = '/api/admin/backup/export';
  };

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: '#71717a' }}>Loading settings...</div>;
  }

  return (
    <div style={{ maxWidth: '640px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ margin: '0 0 0.25rem 0' }}>Operational & System Settings</h2>
        <span style={{ fontSize: '0.85rem', color: '#71717a' }}>
          Configure housekeeping workloads, headcount capacity thresholds, display preferences, and backup data.
        </span>
      </div>

      {success && (
        <div style={{ padding: '0.75rem 1rem', backgroundColor: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: '6px', color: '#166534', fontSize: '0.9rem', fontWeight: '500' }}>
          ✓ Operational settings and preferences updated successfully!
        </div>
      )}

      {error && (
        <div style={{ padding: '0.75rem 1rem', backgroundColor: '#fee2e2', border: '1px solid #fecaca', borderRadius: '6px', color: '#991b1b', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ background: '#fff', padding: '1.75rem', borderRadius: '8px', border: '1px solid #e4e4e7', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Section 1: Housekeeping */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
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

          <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.85rem', color: '#475569' }}>
            ℹ️ <strong>Calculated Workload:</strong> {shiftDuration.toFixed(1)} hours per shift • <strong>{targetWeeklyHours.toFixed(1)} target weekly hours</strong> per volunteer.
          </div>
        </div>

        {/* Section 2: Headcount Capacity Targets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
            👥 Headcount Capacity Targets & Thresholds
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.875rem', fontWeight: '500', color: '#334155' }}>
              Baseline Target
              <input
                type="number"
                min="1"
                max="30"
                value={settings.headcountBaseline}
                onChange={(e) => setSettings({ ...settings, headcountBaseline: parseInt(e.target.value, 10) || 11 })}
                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                required
              />
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Ideal target total confirmed staff on site (Default: 11)</span>
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.875rem', fontWeight: '500', color: '#334155' }}>
              Critical Lower Bound
              <input
                type="number"
                min="1"
                max="20"
                value={settings.headcountCritical}
                onChange={(e) => setSettings({ ...settings, headcountCritical: parseInt(e.target.value, 10) || 8 })}
                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                required
              />
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Critical shortage threshold (Red alert if &lt; {settings.headcountCritical})</span>
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.875rem', fontWeight: '500', color: '#334155' }}>
              Low Staffing (Min)
              <input
                type="number"
                min="1"
                max="25"
                value={settings.headcountLowMin}
                onChange={(e) => setSettings({ ...settings, headcountLowMin: parseInt(e.target.value, 10) || 8 })}
                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                required
              />
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Yellow warning lower range (Default: 8)</span>
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.875rem', fontWeight: '500', color: '#334155' }}>
              Low Staffing (Max)
              <input
                type="number"
                min="1"
                max="25"
                value={settings.headcountLowMax}
                onChange={(e) => setSettings({ ...settings, headcountLowMax: parseInt(e.target.value, 10) || 10 })}
                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                required
              />
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Yellow warning upper range (Default: 10)</span>
            </label>
          </div>
        </div>

        {/* Section 3: Global Display Preferences */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
            🌍 Display & Date Preferences
          </h3>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.875rem', fontWeight: '500', color: '#334155' }}>
            Date Format
            <select
              value={settings.dateFormatPreference}
              onChange={(e) => setSettings({ ...settings, dateFormatPreference: e.target.value })}
              style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: '#fff', fontSize: '0.95rem' }}
            >
              <option value="YYYY-MM-DD">YYYY-MM-DD (ISO standard, e.g. 2026-11-09)</option>
              <option value="DD-MM-YYYY">DD-MM-YYYY (European format, e.g. 09-11-2026)</option>
            </select>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Choose how calendar dates are presented across the user interface.</span>
          </label>
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

      {/* Section 4: Data Management & Backup */}
      <div style={{ background: '#fff', padding: '1.75rem', borderRadius: '8px', border: '1px solid #e4e4e7', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
          💾 Data Management & Backup
        </h3>
        <p style={{ margin: 0, fontSize: '0.875rem', color: '#475569', lineHeight: 1.5 }}>
          Export the complete self-hosted SQLite database for offline backup or disaster recovery. You can restore this file at any time by copying it back to the host system.
        </p>

        <div>
          <button
            type="button"
            onClick={handleDownloadBackup}
            style={{
              padding: '0.6rem 1.25rem',
              backgroundColor: '#10b981',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.9rem'
            }}
          >
            📥 Download Database Backup (.sqlite)
          </button>
        </div>
      </div>
    </div>
  );
};
