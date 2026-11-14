import React, { useEffect, useState, useMemo } from 'react';
import { VolunteerModal } from '../components/VolunteerModal';
import { CountryFlag } from '../components/CountryFlag';
import { DepartureModal } from '../components/DepartureModal';
import { ReactivateModal } from '../components/ReactivateModal';
import { StayHistoryModal } from '../components/StayHistoryModal';
import { getBirthdayAlert, calculateAge } from '../utils/date-utils';
import { useDateFormat } from '../context/DateFormatContext';

export const AdminVolunteersPage: React.FC = () => {
  const { formatDate } = useDateFormat();
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [filter, setFilter] = useState('Active');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVol, setSelectedVol] = useState<any>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter States
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('All');
  const [rehireFilter, setRehireFilter] = useState('All');
  const [ratingFilter, setRatingFilter] = useState('All');
  const [nationalityFilter, setNationalityFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Modals State
  const [departingVol, setDepartingVol] = useState<any>(null);
  const [reactivatingVol, setReactivatingVol] = useState<any>(null);
  const [stayHistoryVol, setStayHistoryVol] = useState<any>(null);

  // Acceptance Dialog State
  const [acceptingVol, setAcceptingVol] = useState<any>(null);
  const [acceptDates, setAcceptDates] = useState({ arrivalDate: '', departureDate: '', primaryRole: 'Housekeeping', notes: '' });

  const fetchVolunteers = async () => {
    try {
      const res = await fetch(`/api/admin/volunteers?status=${filter}`);
      const data = await res.json();
      setVolunteers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchVolunteers();
  }, [filter]);

  const handleCopyLink = (token: string, volId: string) => {
    const url = `${window.location.origin}/portal?token=${token}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setCopiedId(volId);
        setTimeout(() => setCopiedId(null), 2000);
      }).catch(() => {
        prompt('Copy portal link:', url);
      });
    } else {
      prompt('Copy portal link:', url);
    }
  };

  const handleResetToken = async (volId: string) => {
    if (window.confirm('Regenerate this magic link? The previous link will be immediately invalidated.')) {
      await fetch(`/api/admin/volunteers/${volId}/reset-token`, { method: 'POST' });
      fetchVolunteers();
    }
  };

  const handleSave = async (data: any) => {
    const method = selectedVol ? 'PUT' : 'POST';
    const url = selectedVol ? `/api/admin/volunteers/${selectedVol.id}` : '/api/admin/volunteers';
    
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    setIsModalOpen(false);
    fetchVolunteers();
  };

  const handleOpenAcceptDialog = (vol: any) => {
    setAcceptingVol(vol);
    setAcceptDates({
      arrivalDate: vol.arrivalDate || '',
      departureDate: vol.departureDate || '',
      primaryRole: vol.primaryRole || 'Housekeeping',
      notes: vol.notes || ''
    });
  };

  const handleConfirmAccept = async () => {
    if (!acceptDates.arrivalDate || !acceptDates.departureDate) {
      alert('Please enter both arrival and departure dates.');
      return;
    }

    try {
      await fetch(`/api/admin/volunteers/${acceptingVol.id}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(acceptDates)
      });
      setAcceptingVol(null);
      fetchVolunteers();
    } catch (e) {
      console.error(e);
      alert('Failed to accept volunteer');
    }
  };

  const handleActivate = async (id: string) => {
    if (window.confirm('Mark this volunteer as Arrived / Active on site?')) {
      await fetch(`/api/admin/volunteers/${id}/activate`, { method: 'POST' });
      fetchVolunteers();
    }
  };

  const handleCancel = async (id: string) => {
    const reason = prompt('Cancellation reason (optional):');
    if (reason !== null) {
      await fetch(`/api/admin/volunteers/${id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cancellationReason: reason })
      });
      fetchVolunteers();
    }
  };

  const handleConfirmDepart = async (data: { departureRating: number; departureNotes: string; rehireStatus: string }) => {
    if (!departingVol) return;
    await fetch(`/api/admin/volunteers/${departingVol.id}/depart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    fetchVolunteers();
  };

  const handleConfirmReactivate = async (data: { arrivalDate: string; departureDate?: string | null; noEndDate?: boolean }) => {
    if (!reactivatingVol) return;
    await fetch(`/api/admin/volunteers/${reactivatingVol.id}/reactivate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    fetchVolunteers();
  };

  // Filter volunteers based on multi-parameter filters
  const filteredVolunteers = useMemo(() => {
    return volunteers.filter(v => {
      // Name / keyword search
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = v.fullName?.toLowerCase().includes(q) || v.preferredName?.toLowerCase().includes(q);
        const matchesNat = v.nationality?.toLowerCase().includes(q);
        if (!matchesName && !matchesNat) return false;
      }

      // Gender filter
      if (genderFilter !== 'All') {
        if ((v.gender || 'Unspecified') !== genderFilter) return false;
      }

      // Nationality filter
      if (nationalityFilter.trim()) {
        if (!v.nationality?.toLowerCase().includes(nationalityFilter.trim().toLowerCase())) return false;
      }

      // Rehire eligibility filter
      if (rehireFilter !== 'All') {
        const rehire = v.latestRehireStatus || v.futureAcceptance;
        if (rehire !== rehireFilter) return false;
      }

      // Rating filter
      if (ratingFilter !== 'All') {
        const rating = v.latestRating;
        if (ratingFilter === '5' && rating !== 5) return false;
        if (ratingFilter === '4+' && (!rating || rating < 4)) return false;
        if (ratingFilter === '3+' && (!rating || rating < 3)) return false;
      }

      // Date Range filters
      if (dateFrom && v.departureDate && v.departureDate < dateFrom) return false;
      if (dateTo && v.arrivalDate && v.arrivalDate > dateTo) return false;

      return true;
    });
  }, [volunteers, search, genderFilter, rehireFilter, ratingFilter, nationalityFilter, dateFrom, dateTo]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: '0 0 0.25rem 0' }}>Volunteer Management</h2>
          <span style={{ fontSize: '0.85rem', color: '#71717a' }}>Track volunteers through application, stay, and review.</span>
        </div>
        <button 
          onClick={() => { setSelectedVol(null); setIsModalOpen(true); }}
          style={{ padding: '0.6rem 1.25rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}
        >
          + New Application
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', borderBottom: '2px solid #e4e4e7', paddingBottom: '0.5rem' }}>
        {['Applied', 'Accepted', 'Active', 'Departed', 'Cancelled'].map(s => (
          <button 
            key={s} 
            onClick={() => { setFilter(s); setSearch(''); }}
            style={{ 
              background: 'none', 
              border: 'none', 
              fontWeight: filter === s ? 'bold' : 'normal',
              color: filter === s ? '#3b82f6' : '#52525b',
              borderBottom: filter === s ? '2px solid #3b82f6' : 'none',
              marginBottom: '-0.6rem',
              paddingBottom: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.95rem'
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Filter Controls Bar (available across Accepted, Active, Departed, Applied) */}
      <div style={{ background: '#fff', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #e4e4e7', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', fontSize: '0.85rem' }}>
        <input
          type="text"
          placeholder="🔍 Search name or code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '0.4rem 0.6rem', borderRadius: '4px', border: '1px solid #cbd5e1', width: '180px' }}
        />

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#475569' }}>
          Gender:
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            style={{ padding: '0.35rem 0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: '#fff' }}
          >
            <option value="All">All</option>
            <option value="Male">♂ Male</option>
            <option value="Female">♀ Female</option>
            <option value="Neutral">⚧ Neutral</option>
            <option value="Unspecified">⚪ Unspecified</option>
          </select>
        </label>

        <input
          type="text"
          placeholder="Nationality (e.g. FR)"
          value={nationalityFilter}
          onChange={(e) => setNationalityFilter(e.target.value)}
          style={{ padding: '0.4rem 0.6rem', borderRadius: '4px', border: '1px solid #cbd5e1', width: '130px' }}
        />

        {filter === 'Departed' && (
          <>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#475569' }}>
              Rehire:
              <select
                value={rehireFilter}
                onChange={(e) => setRehireFilter(e.target.value)}
                style={{ padding: '0.35rem 0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: '#fff' }}
              >
                <option value="All">All</option>
                <option value="Accept">Accept (Good)</option>
                <option value="Possible">Possible (Meh)</option>
                <option value="Don't Accept">Don't Accept (Bad)</option>
              </select>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#475569' }}>
              Rating:
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                style={{ padding: '0.35rem 0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: '#fff' }}
              >
                <option value="All">All Ratings</option>
                <option value="5">★★★★★ (5 Stars)</option>
                <option value="4+">★★★★☆ (4+ Stars)</option>
                <option value="3+">★★★☆☆ (3+ Stars)</option>
              </select>
            </label>
          </>
        )}

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#475569' }}>
          From:
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            style={{ padding: '0.3rem 0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
          />
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#475569' }}>
          To:
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            style={{ padding: '0.3rem 0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
          />
        </label>

        {(search || genderFilter !== 'All' || rehireFilter !== 'All' || ratingFilter !== 'All' || nationalityFilter || dateFrom || dateTo) && (
          <button
            onClick={() => {
              setSearch('');
              setGenderFilter('All');
              setRehireFilter('All');
              setRatingFilter('All');
              setNationalityFilter('');
              setDateFrom('');
              setDateTo('');
            }}
            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.8rem' }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Volunteer Cards Grid */}
      <div style={{ display: 'grid', gap: '1rem' }}>
        {filteredVolunteers.map(v => {
          const bdayAlert = getBirthdayAlert(v.dateOfBirth);
          const age = calculateAge(v.dateOfBirth);
          const ratingStars = v.latestRating ? '★'.repeat(v.latestRating) + '☆'.repeat(5 - v.latestRating) : null;
          const rehireStatus = v.latestRehireStatus || v.futureAcceptance;

          return (
          <div key={v.id} style={{ background: '#fff', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e4e4e7', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ margin: '0 0 0.35rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span>{v.preferredName ? `${v.preferredName} (${v.fullName})` : v.fullName}</span>
                  
                  {/* Gender Symbol */}
                  {v.gender === 'Male' && <span title="Male" style={{ color: '#2563eb', fontWeight: 'bold', fontSize: '1.1rem' }}>♂</span>}
                  {v.gender === 'Female' && <span title="Female" style={{ color: '#db2777', fontWeight: 'bold', fontSize: '1.1rem' }}>♀</span>}
                  {v.gender === 'Neutral' && <span title="Neutral" style={{ color: '#9333ea', fontWeight: 'bold', fontSize: '1.1rem' }}>⚧</span>}
                  {v.gender === 'Unspecified' && <span title="Unspecified" style={{ color: '#94a3b8', fontSize: '0.9rem' }}>⚪</span>}

                  <CountryFlag countryCode={v.nationality} />

                  <span style={{ 
                    fontSize: '0.75rem', 
                    padding: '0.2rem 0.5rem', 
                    borderRadius: '4px', 
                    fontWeight: 'normal',
                    backgroundColor: v.status === 'Active' ? '#bbf7d0' : v.status === 'Accepted' ? '#dbeafe' : v.status === 'Applied' ? '#fef08a' : '#f4f4f5',
                    color: v.status === 'Active' ? '#166534' : v.status === 'Accepted' ? '#1e40af' : v.status === 'Applied' ? '#854d0e' : '#52525b'
                  }}>
                    {v.status}
                  </span>

                  {/* Rating Stars for Departed */}
                  {v.status === 'Departed' && ratingStars && (
                    <span style={{ color: '#f59e0b', fontSize: '1.1rem', letterSpacing: '0.05em' }} title={`${v.latestRating} Stars`}>
                      {ratingStars}
                    </span>
                  )}

                  {/* Rehire Box for Departed (Green / Yellow / Red) */}
                  {v.status === 'Departed' && rehireStatus && (
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '4px',
                      backgroundColor: rehireStatus === 'Accept' ? '#dcfce7' : rehireStatus === 'Possible' ? '#fef9c3' : '#fee2e2',
                      color: rehireStatus === 'Accept' ? '#166534' : rehireStatus === 'Possible' ? '#854d0e' : '#991b1b',
                      border: `1px solid ${rehireStatus === 'Accept' ? '#bbf7d0' : rehireStatus === 'Possible' ? '#fef08a' : '#fecaca'}`
                    }}>
                      {rehireStatus}
                    </span>
                  )}

                  {/* Birthday Alert */}
                  {bdayAlert?.isUpcoming && (
                    <span 
                      style={{ 
                        fontSize: '0.75rem', 
                        padding: '0.2rem 0.5rem', 
                        borderRadius: '4px', 
                        backgroundColor: '#fdf2f8', 
                        color: '#db2777', 
                        border: '1px solid #fbcfe8', 
                        fontWeight: 'bold',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}
                      title={`Birthday: ${bdayAlert.birthdayFormatted}`}
                    >
                      🎂 {bdayAlert.daysUntil === 0 ? 'Birthday Today! 🎉' : `Birthday in ${bdayAlert.daysUntil} day${bdayAlert.daysUntil > 1 ? 's' : ''}!`}
                    </span>
                  )}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.25rem' }}>
                  {/* Line 1: Role, Source, Stay Dates, Age, and Badges */}
                  <div style={{ fontSize: '0.85rem', color: '#71717a', display: 'flex', flexWrap: 'wrap', gap: '1.25rem', alignItems: 'center' }}>
                    <span><strong>Role:</strong> {v.primaryRole}</span>
                    <span><strong>Source:</strong> {v.applicationSourceName || (v.source && v.source !== 'Other' ? v.source : (v.applicationSourceName || v.source || 'None'))}</span>
                    <span>
                      <strong>Stay Dates:</strong> {v.arrivalDate ? formatDate(v.arrivalDate) : 'TBD'} → {v.noEndDate ? 'No end date' : (v.departureDate ? formatDate(v.departureDate) : 'TBD')}
                    </span>
                    {age !== null && <span><strong>Age:</strong> {age}</span>}
                    {v.isTrainer && <span style={{ color: '#059669', fontWeight: '500' }}>✓ Trainer</span>}
                    {v.inTraining && <span style={{ color: '#d97706', fontWeight: '500' }}>• In Training</span>}
                    {v.isReceptionQualified && <span style={{ color: '#2563eb' }}>✓ Reception Qualified</span>}

                    {/* Stay History Link */}
                    <button
                      onClick={() => setStayHistoryVol(v)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#2563eb',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        textDecoration: 'underline',
                        padding: 0
                      }}
                    >
                      📜 Stays ({v.staysCount || 1})
                    </button>
                  </div>

                  {/* Line 2: Email & Phone Number */}
                  <div style={{ fontSize: '0.85rem', color: '#475569', display: 'flex', flexWrap: 'wrap', gap: '1.25rem', alignItems: 'center' }}>
                    <span>
                      <strong>Email:</strong>{' '}
                      {v.email ? (
                        <a href={`mailto:${v.email}`} style={{ color: '#2563eb', textDecoration: 'none' }}>
                          {v.email}
                        </a>
                      ) : (
                        <span style={{ color: '#a1a1aa' }}>None</span>
                      )}
                    </span>
                    <span>
                      <strong>Phone:</strong>{' '}
                      {v.phone ? (
                        <a href={`tel:${v.phone}`} style={{ color: '#2563eb', textDecoration: 'none' }}>
                          {v.phone}
                        </a>
                      ) : (
                        <span style={{ color: '#a1a1aa' }}>None</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons for Each Lifecycle Phase */}
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button 
                  onClick={() => { setSelectedVol(v); setIsModalOpen(true); }}
                  style={{ padding: '0.4rem 0.75rem', background: '#f4f4f5', border: '1px solid #d4d4d8', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  Edit / Notes
                </button>

                {v.status === 'Applied' && (
                  <>
                    <button 
                      onClick={() => handleOpenAcceptDialog(v)}
                      style={{ padding: '0.4rem 0.75rem', background: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500' }}
                    >
                      ✓ Accept
                    </button>
                    <button 
                      onClick={() => handleCancel(v.id)}
                      style={{ padding: '0.4rem 0.75rem', background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                    >
                      Cancel
                    </button>
                  </>
                )}

                {v.status === 'Accepted' && (
                  <>
                    <button 
                      onClick={() => handleActivate(v.id)}
                      style={{ padding: '0.4rem 0.75rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500' }}
                    >
                      Mark Arrived
                    </button>
                    <button 
                      onClick={() => handleCancel(v.id)}
                      style={{ padding: '0.4rem 0.75rem', background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                    >
                      Cancel
                    </button>
                  </>
                )}

                {v.status === 'Active' && (
                  <>
                    <button 
                      onClick={() => setDepartingVol(v)}
                      style={{ padding: '0.4rem 0.75rem', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500' }}
                    >
                      Depart
                    </button>
                    <button 
                      onClick={() => handleCancel(v.id)}
                      style={{ padding: '0.4rem 0.75rem', background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                    >
                      Cancel
                    </button>
                  </>
                )}

                {v.status === 'Departed' && (
                  <button 
                    onClick={() => setReactivatingVol(v)}
                    style={{ padding: '0.4rem 0.75rem', background: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500' }}
                  >
                    Re-activate
                  </button>
                )}

                {v.status === 'Cancelled' && (
                  <button 
                    onClick={() => handleActivate(v.id)}
                    style={{ padding: '0.4rem 0.75rem', background: '#e0e7ff', color: '#3730a3', border: '1px solid #c7d2fe', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                  >
                    Re-activate
                  </button>
                )}
              </div>
            </div>

            {/* Magic Link Section */}
            {v.magicLinkToken && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f8fafc', padding: '0.4rem 0.6rem', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '0.8rem' }}>
                <span style={{ fontWeight: '600', color: '#475569', minWidth: '75px' }}>Magic Link:</span>
                <input 
                  type="text" 
                  readOnly 
                  value={`${window.location.origin}/portal?token=${v.magicLinkToken}`} 
                  style={{ flex: 1, padding: '0.2rem 0.4rem', border: '1px solid #cbd5e1', borderRadius: '3px', fontSize: '0.75rem', background: '#fff', color: '#334155' }}
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <button 
                  onClick={() => handleCopyLink(v.magicLinkToken, v.id)}
                  style={{ padding: '0.25rem 0.6rem', background: copiedId === v.id ? '#10b981' : '#3b82f6', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '500' }}
                >
                  {copiedId === v.id ? '✓ Copied!' : 'Copy Link'}
                </button>
                <button 
                  onClick={() => handleResetToken(v.id)}
                  style={{ padding: '0.25rem 0.5rem', background: '#fff', border: '1px solid #cbd5e1', color: '#475569', borderRadius: '3px', cursor: 'pointer', fontSize: '0.75rem' }}
                  title="Generate a new magic link and invalidate previous link"
                >
                  🔄 Reset Link
                </button>
              </div>
            )}

            {/* Universal Notes Display */}
            {v.notes && (
              <div style={{ background: '#f8fafc', padding: '0.6rem 0.75rem', borderRadius: '4px', borderLeft: '3px solid #3b82f6', fontSize: '0.85rem', color: '#334155' }}>
                <strong>Notes:</strong> {v.notes}
              </div>
            )}
          </div>
          );
        })}
        
        {filteredVolunteers.length === 0 && (
          <div style={{ color: '#a1a1aa', padding: '2rem', textAlign: 'center' }}>
            No volunteers match the selected filter criteria.
          </div>
        )}
      </div>

      {/* Volunteer Add/Edit Modal */}
      {isModalOpen && (
        <VolunteerModal 
          volunteer={selectedVol} 
          onSave={handleSave} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}

      {/* Departure Review Modal (5 stars, notes, rehire status) */}
      {departingVol && (
        <DepartureModal
          isOpen={!!departingVol}
          volunteer={departingVol}
          onClose={() => setDepartingVol(null)}
          onSubmit={handleConfirmDepart}
        />
      )}

      {/* Re-Activate Volunteer Modal */}
      {reactivatingVol && (
        <ReactivateModal
          isOpen={!!reactivatingVol}
          volunteer={reactivatingVol}
          onClose={() => setReactivatingVol(null)}
          onSubmit={handleConfirmReactivate}
        />
      )}

      {/* Stay History Modal */}
      {stayHistoryVol && (
        <StayHistoryModal
          isOpen={!!stayHistoryVol}
          volunteer={stayHistoryVol}
          onClose={() => setStayHistoryVol(null)}
        />
      )}

      {/* Accept Volunteer Dialog */}
      {acceptingVol && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100 }}>
          <div style={{ background: '#fff', padding: '2rem', borderRadius: '8px', width: '450px' }}>
            <h3 style={{ marginTop: 0 }}>Accept Volunteer: {acceptingVol.fullName}</h3>
            <p style={{ fontSize: '0.9rem', color: '#52525b' }}>Confirm agreed stay dates and primary role to lock in acceptance.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <strong>Arrival Date</strong>
                <input 
                  type="date" 
                  value={acceptDates.arrivalDate} 
                  onChange={(e) => setAcceptDates(prev => ({ ...prev, arrivalDate: e.target.value }))}
                  style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #d4d4d8' }}
                />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <strong>Departure Date</strong>
                <input 
                  type="date" 
                  value={acceptDates.departureDate} 
                  onChange={(e) => setAcceptDates(prev => ({ ...prev, departureDate: e.target.value }))}
                  style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #d4d4d8' }}
                />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <strong>Primary Role</strong>
                <select 
                  value={acceptDates.primaryRole}
                  onChange={(e) => setAcceptDates(prev => ({ ...prev, primaryRole: e.target.value }))}
                  style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #d4d4d8', backgroundColor: '#fff' }}
                >
                  <option value="Housekeeping">Housekeeping</option>
                  <option value="Reception">Reception</option>
                </select>
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <strong>Acceptance Notes</strong>
                <textarea 
                  value={acceptDates.notes}
                  onChange={(e) => setAcceptDates(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Notes about interview, agreed hours, or arrival logistics..."
                  style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #d4d4d8', minHeight: '60px' }}
                />
              </label>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button 
                  onClick={() => setAcceptingVol(null)}
                  style={{ padding: '0.5rem 1rem', background: '#fff', border: '1px solid #d4d4d8', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmAccept}
                  style={{ padding: '0.5rem 1.25rem', background: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}
                >
                  Confirm Acceptance
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
