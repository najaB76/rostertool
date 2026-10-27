import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './styles/main.css';
import { AdminRosterPage } from './pages/AdminRosterPage';
import { AdminVolunteersPage } from './pages/AdminVolunteersPage';
import { AdminHeadcountPage } from './pages/AdminHeadcountPage';
import { AdminTimeOffPage } from './pages/AdminTimeOffPage';
import { VolunteerPortalPage } from './pages/VolunteerPortalPage';

const AdminLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="admin-layout">
    <header className="admin-header">
      <h1>Hostel Roster</h1>
      <nav>
        <Link to="/admin/roster">Weekly Roster</Link>
        <Link to="/admin/volunteers">Volunteers</Link>
        <Link to="/admin/headcount">Headcount</Link>
        <Link to="/admin/time-off">Time Off</Link>
      </nav>
    </header>
    <main className="admin-main">{children}</main>
  </div>
);

export function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AdminLayout><AdminRosterPage /></AdminLayout>} />
        <Route path="/admin/roster" element={<AdminLayout><AdminRosterPage /></AdminLayout>} />
        <Route path="/admin/volunteers" element={<AdminLayout><AdminVolunteersPage /></AdminLayout>} />
        <Route path="/admin/headcount" element={<AdminLayout><AdminHeadcountPage /></AdminLayout>} />
        <Route path="/admin/time-off" element={<AdminLayout><AdminTimeOffPage /></AdminLayout>} />
        <Route path="/portal" element={<VolunteerPortalPage />} />
      </Routes>
    </Router>
  );
}

export default App;
