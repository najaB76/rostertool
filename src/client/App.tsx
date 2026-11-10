import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import './styles/main.css';
import { AdminRosterPage } from './pages/AdminRosterPage';
import { AdminVolunteersPage } from './pages/AdminVolunteersPage';
import { AdminHeadcountPage } from './pages/AdminHeadcountPage';
import { AdminTimeOffPage } from './pages/AdminTimeOffPage';
import { AdminStaffPage } from './pages/AdminStaffPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { AdminSettingsPage } from './pages/AdminSettingsPage';
import { AdminTimelinePage } from './pages/AdminTimelinePage';
import { LoginPage } from './pages/LoginPage';
import { VolunteerPortalPage } from './pages/VolunteerPortalPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ChangePinModal } from './components/ChangePinModal';
import { DateFormatProvider } from './context/DateFormatContext';

// Install transparent fetch interceptor for admin authorization & 401 handling
if (typeof window !== 'undefined' && !(window as any).__fetchInterceptorInstalled) {
  (window as any).__fetchInterceptorInstalled = true;
  const originalFetch = window.fetch;
  window.fetch = async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : (input as Request).url;

    if (url.startsWith('/api/admin')) {
      const token = localStorage.getItem('admin_token');
      const headers = new Headers(init.headers || {});
      if (token && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      init = { ...init, headers };
    }

    const response = await originalFetch(input, init);

    if (response.status === 401 && url.startsWith('/api/admin')) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_username');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?expired=1';
      }
    }

    return response;
  };
}

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const [isChangePinOpen, setIsChangePinOpen] = useState(false);

  // 30-minute inactivity auto-logout timer
  useEffect(() => {
    let timeoutId: any;
    const INACTIVITY_LIMIT_MS = 30 * 60 * 1000;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_username');
        window.location.href = '/login?expired=1';
      }, INACTIVITY_LIMIT_MS);
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(evt => window.addEventListener(evt, resetTimer, { passive: true }));
    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach(evt => window.removeEventListener(evt, resetTimer));
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_username');
    navigate('/login');
  };

  return (
    <div className="admin-layout">
      <header className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <h1 style={{ margin: 0, fontSize: '1.25rem' }}>Hostel Roster</h1>
          <nav style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/admin/roster">Weekly Roster</Link>
            <Link to="/admin/timeline">Timeline</Link>
            <Link to="/admin/volunteers">Volunteers</Link>
            <Link to="/admin/headcount">Headcount</Link>
            <Link to="/admin/time-off">Time Off</Link>
            <Link to="/admin/staff">Staff</Link>
            <Link to="/admin/users">Admin Users</Link>
            <Link to="/admin/settings">Settings</Link>
          </nav>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={() => setIsChangePinOpen(true)}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#fff',
              padding: '0.35rem 0.75rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            Change PIN
          </button>
          <button
            onClick={handleLogout}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#fff',
              padding: '0.35rem 0.75rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            Logout
          </button>
        </div>
      </header>
      <main className="admin-main">{children}</main>

      {/* Self-Service PIN Change Modal */}
      <ChangePinModal isOpen={isChangePinOpen} onClose={() => setIsChangePinOpen(false)} />
    </div>
  );
};

export function App() {
  return (
    <DateFormatProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ProtectedRoute><AdminLayout><AdminRosterPage /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/roster" element={<ProtectedRoute><AdminLayout><AdminRosterPage /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/timeline" element={<ProtectedRoute><AdminLayout><AdminTimelinePage /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/volunteers" element={<ProtectedRoute><AdminLayout><AdminVolunteersPage /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/headcount" element={<ProtectedRoute><AdminLayout><AdminHeadcountPage /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/time-off" element={<ProtectedRoute><AdminLayout><AdminTimeOffPage /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/staff" element={<ProtectedRoute><AdminLayout><AdminStaffPage /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute><AdminLayout><AdminUsersPage /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute><AdminLayout><AdminSettingsPage /></AdminLayout></ProtectedRoute>} />
          <Route path="/portal" element={<VolunteerPortalPage />} />
        </Routes>
      </Router>
    </DateFormatProvider>
  );
}

export default App;
