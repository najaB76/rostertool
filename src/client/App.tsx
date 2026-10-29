import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import './styles/main.css';
import { AdminRosterPage } from './pages/AdminRosterPage';
import { AdminVolunteersPage } from './pages/AdminVolunteersPage';
import { AdminHeadcountPage } from './pages/AdminHeadcountPage';
import { AdminTimeOffPage } from './pages/AdminTimeOffPage';
import { AdminStaffPage } from './pages/AdminStaffPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { AdminSettingsPage } from './pages/AdminSettingsPage';
import { LoginPage } from './pages/LoginPage';
import { VolunteerPortalPage } from './pages/VolunteerPortalPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ChangePinModal } from './components/ChangePinModal';

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const [isChangePinOpen, setIsChangePinOpen] = useState(false);

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
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<ProtectedRoute><AdminLayout><AdminRosterPage /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/roster" element={<ProtectedRoute><AdminLayout><AdminRosterPage /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/volunteers" element={<ProtectedRoute><AdminLayout><AdminVolunteersPage /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/headcount" element={<ProtectedRoute><AdminLayout><AdminHeadcountPage /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/time-off" element={<ProtectedRoute><AdminLayout><AdminTimeOffPage /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/staff" element={<ProtectedRoute><AdminLayout><AdminStaffPage /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute><AdminLayout><AdminUsersPage /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute><AdminLayout><AdminSettingsPage /></AdminLayout></ProtectedRoute>} />
        <Route path="/portal" element={<VolunteerPortalPage />} />
      </Routes>
    </Router>
  );
}

export default App;
