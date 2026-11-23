import React, { useEffect, useState, useMemo } from 'react';
import { CountryFlag } from '../components/CountryFlag';

function sortData<T>(list: T[], key: keyof T, direction: 'asc' | 'desc'): T[] {
  return [...list].sort((a, b) => {
    const valA = a[key];
    const valB = b[key];

    if (valA === null || valA === undefined) return 1;
    if (valB === null || valB === undefined) return -1;

    if (typeof valA === 'number' && typeof valB === 'number') {
      return direction === 'asc' ? valA - valB : valB - valA;
    }

    const strA = String(valA).toLowerCase();
    const strB = String(valB).toLowerCase();
    return direction === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
  });
}

export const AdminReportsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'country' | 'continent' | 'age' | 'gender' | 'rehire'>('country');
  const [viewMode, setViewMode] = useState<'both' | 'chart' | 'table'>('both');

  // Date Filtering State
  const [preset, setPreset] = useState<'all' | 'this-year' | 'last-year' | 'last-12m' | 'custom'>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Table Sorting States
  const [sortField, setSortField] = useState<string>('volunteerCount');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const fetchReports = (start?: string, end?: string) => {
    setLoading(true);
    let url = '/api/admin/reports';
    const params = new URLSearchParams();
    if (start) params.set('startDate', start);
    if (end) params.set('endDate', end);
    const qs = params.toString();
    if (qs) url += `?${qs}`;

    fetch(url)
      .then(res => res.json())
      .then(d => setData(d))
      .catch(err => console.error('Failed to load reports:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReports(startDate, endDate);
  }, [startDate, endDate]);

  const handlePresetChange = (newPreset: 'all' | 'this-year' | 'last-year' | 'last-12m' | 'custom') => {
    setPreset(newPreset);
    const currentYear = new Date().getFullYear();

    if (newPreset === 'all') {
      setStartDate('');
      setEndDate('');
    } else if (newPreset === 'this-year') {
      setStartDate(`${currentYear}-01-01`);
      setEndDate(`${currentYear}-12-31`);
    } else if (newPreset === 'last-year') {
      setStartDate(`${currentYear - 1}-01-01`);
      setEndDate(`${currentYear - 1}-12-31`);
    } else if (newPreset === 'last-12m') {
      const today = new Date();
      const past = new Date();
      past.setFullYear(today.getFullYear() - 1);
      setStartDate(past.toISOString().split('T')[0]);
      setEndDate(today.toISOString().split('T')[0]);
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const renderSortIndicator = (field: string) => {
    if (sortField !== field) return <span style={{ color: '#94a3b8', marginLeft: '0.25rem' }}>↕</span>;
    return <span style={{ color: '#2563eb', marginLeft: '0.25rem', fontWeight: 'bold' }}>{sortDirection === 'asc' ? '▲' : '▼'}</span>;
  };

  // Sorted Datasets
  const sortedCountryData = useMemo(() => {
    if (!data?.byCountry) return [];
    return sortData(data.byCountry, sortField as any, sortDirection);
  }, [data?.byCountry, sortField, sortDirection]);

  const sortedContinentData = useMemo(() => {
    if (!data?.byContinent) return [];
    return sortData(data.byContinent, sortField as any, sortDirection);
  }, [data?.byContinent, sortField, sortDirection]);

  const sortedAgeData = useMemo(() => {
    if (!data?.byAgeBracket) return [];
    return sortData(data.byAgeBracket, sortField as any, sortDirection);
  }, [data?.byAgeBracket, sortField, sortDirection]);

  const sortedGenderData = useMemo(() => {
    if (!data?.byGender) return [];
    return sortData(data.byGender, sortField as any, sortDirection);
  }, [data?.byGender, sortField, sortDirection]);

  const sortedRehireData = useMemo(() => {
    if (!data?.rehireRatiosByCountry) return [];
    return sortData(data.rehireRatiosByCountry, sortField as any, sortDirection);
  }, [data?.rehireRatiosByCountry, sortField, sortDirection]);

  if (loading && !data) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading analytics and reports...</div>;
  }

  if (!data) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: '#ef4444' }}>Failed to load reports data.</div>;
  }

  const { kpis, byCountry, byContinent, byAgeBracket, byGender, rehireRatiosByCountry } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', maxWidth: '1100px' }}>
      {/* Header & Date Filtering Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: '0 0 0.25rem 0' }}>Volunteer Analytics & Reports</h2>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Historical staffing statistics, demographic crosstabulations, star ratings, and rehire distributions.
          </span>
        </div>

        {/* Date Filter Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'All Time' },
              { id: 'this-year', label: 'This Year' },
              { id: 'last-year', label: 'Last Year' },
              { id: 'last-12m', label: 'Last 12 Months' },
              { id: 'custom', label: 'Custom' }
            ].map(p => (
              <button
                key={p.id}
                onClick={() => handlePresetChange(p.id as any)}
                style={{
                  padding: '0.25rem 0.55rem',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1',
                  background: preset === p.id ? '#2563eb' : '#fff',
                  color: preset === p.id ? '#fff' : '#475569',
                  fontSize: '0.75rem',
                  fontWeight: preset === p.id ? 'bold' : 'normal',
                  cursor: 'pointer'
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          {(preset === 'custom' || startDate || endDate) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                From:
                <input
                  type="date"
                  value={startDate}
                  onChange={e => { setPreset('custom'); setStartDate(e.target.value); }}
                  style={{ padding: '0.2rem 0.4rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.75rem' }}
                />
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                To:
                <input
                  type="date"
                  value={endDate}
                  onChange={e => { setPreset('custom'); setEndDate(e.target.value); }}
                  style={{ padding: '0.2rem 0.4rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.75rem' }}
                />
              </label>
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div style={{ background: '#fff', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Volunteers (In Period)</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#0f172a', marginTop: '0.25rem' }}>{kpis.totalVolunteers}</div>
          <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.25rem' }}>Matching selected period</div>
        </div>

        <div style={{ background: '#fff', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Stays (In Period)</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#0f172a', marginTop: '0.25rem' }}>{kpis.totalStays}</div>
          <div style={{ fontSize: '0.75rem', color: '#3b82f6', marginTop: '0.25rem' }}>Active or finished in window</div>
        </div>

        <div style={{ background: '#fff', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Average Rating</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#0f172a', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span>{kpis.averageRating ? kpis.averageRating.toFixed(2) : '—'}</span>
            <span style={{ fontSize: '1.2rem', color: '#f59e0b' }}>★</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>Across completed reviews</div>
        </div>

        <div style={{ background: '#fff', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Rehire Rate</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#0f172a', marginTop: '0.25rem' }}>{kpis.rehireAcceptPercent}%</div>
          <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.25rem' }}>Marked "Accept" on departure</div>
        </div>
      </div>

      {/* Navigation Tabs and Display Options */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { id: 'country', label: '🌍 By Country' },
            { id: 'continent', label: '🌎 By Continent' },
            { id: 'age', label: '🎂 By Age Bracket' },
            { id: 'gender', label: '⚧ By Gender' },
            { id: 'rehire', label: '🔄 Rehire Ratios' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setSortField(tab.id === 'rehire' ? 'totalReviews' : 'volunteerCount');
                setSortDirection('desc');
              }}
              style={{
                padding: '0.45rem 0.9rem',
                borderRadius: '6px',
                border: 'none',
                fontWeight: activeTab === tab.id ? 'bold' : '500',
                cursor: 'pointer',
                backgroundColor: activeTab === tab.id ? '#2563eb' : '#f1f5f9',
                color: activeTab === tab.id ? '#fff' : '#475569',
                fontSize: '0.85rem'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0.25rem', background: '#f1f5f9', padding: '0.25rem', borderRadius: '6px' }}>
          {(['both', 'chart', 'table'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              style={{
                padding: '0.25rem 0.6rem',
                border: 'none',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: viewMode === mode ? 'bold' : 'normal',
                cursor: 'pointer',
                backgroundColor: viewMode === mode ? '#fff' : 'transparent',
                color: viewMode === mode ? '#0f172a' : '#64748b',
                boxShadow: viewMode === mode ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
              }}
            >
              {mode === 'both' ? 'Chart & Table' : mode === 'chart' ? 'Chart Only' : 'Table Only'}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: BY COUNTRY */}
      {activeTab === 'country' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {(viewMode === 'both' || viewMode === 'chart') && (
            <div style={{ background: '#fff', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 1rem 0', color: '#1e293b' }}>Top Countries by Volunteer Volume</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {byCountry.slice(0, 10).map((c: any) => {
                  const maxCount = byCountry[0]?.volunteerCount || 1;
                  const pctWidth = Math.max(4, Math.round((c.volunteerCount / maxCount) * 100));
                  return (
                    <div key={c.country} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem' }}>
                      <div style={{ width: '90px', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: '500' }}>
                        <CountryFlag countryCode={c.country} />
                        <span>{c.country}</span>
                      </div>
                      <div style={{ flex: 1, backgroundColor: '#f1f5f9', borderRadius: '4px', height: '22px', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ width: `${pctWidth}%`, backgroundColor: '#3b82f6', height: '100%', borderRadius: '4px' }} />
                        <span style={{ position: 'absolute', left: '8px', top: '2px', fontSize: '0.75rem', fontWeight: '600', color: pctWidth > 20 ? '#fff' : '#0f172a' }}>
                          {c.volunteerCount} ({c.sharePercent}%)
                        </span>
                      </div>
                      <div style={{ width: '80px', textAlign: 'right', fontSize: '0.8rem', color: '#f59e0b', fontWeight: '600' }}>
                        {c.averageRating ? `${c.averageRating.toFixed(2)} ★` : '—'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {(viewMode === 'both' || viewMode === 'table') && (
            <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                    <th onClick={() => handleSort('country')} style={{ padding: '0.6rem 0.75rem', cursor: 'pointer', userSelect: 'none' }}>
                      Country {renderSortIndicator('country')}
                    </th>
                    <th onClick={() => handleSort('volunteerCount')} style={{ padding: '0.6rem 0.75rem', textAlign: 'right', cursor: 'pointer', userSelect: 'none' }}>
                      Volunteers {renderSortIndicator('volunteerCount')}
                    </th>
                    <th onClick={() => handleSort('sharePercent')} style={{ padding: '0.6rem 0.75rem', textAlign: 'right', cursor: 'pointer', userSelect: 'none' }}>
                      Share {renderSortIndicator('sharePercent')}
                    </th>
                    <th onClick={() => handleSort('averageRating')} style={{ padding: '0.6rem 0.75rem', textAlign: 'right', cursor: 'pointer', userSelect: 'none' }}>
                      Avg Rating {renderSortIndicator('averageRating')}
                    </th>
                    <th onClick={() => handleSort('ratingCount')} style={{ padding: '0.6rem 0.75rem', textAlign: 'right', cursor: 'pointer', userSelect: 'none' }}>
                      Rated Stays {renderSortIndicator('ratingCount')}
                    </th>
                    <th onClick={() => handleSort('rehireAcceptRate')} style={{ padding: '0.6rem 0.75rem', textAlign: 'right', cursor: 'pointer', userSelect: 'none' }}>
                      Rehire Rate {renderSortIndicator('rehireAcceptRate')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedCountryData.map((c: any) => (
                    <tr key={c.country} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '500' }}>
                        <CountryFlag countryCode={c.country} />
                        <span>{c.country}</span>
                      </td>
                      <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', fontWeight: '600' }}>{c.volunteerCount}</td>
                      <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', color: '#64748b' }}>{c.sharePercent}%</td>
                      <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', fontWeight: '600', color: c.averageRating ? '#d97706' : '#94a3b8' }}>
                        {c.averageRating ? `${c.averageRating.toFixed(2)} ★` : '—'}
                      </td>
                      <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', color: '#64748b' }}>{c.ratingCount}</td>
                      <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', color: c.rehireAcceptRate !== null ? (c.rehireAcceptRate >= 70 ? '#16a34a' : '#d97706') : '#94a3b8' }}>
                        {c.rehireAcceptRate !== null ? `${c.rehireAcceptRate}%` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: BY CONTINENT */}
      {activeTab === 'continent' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {(viewMode === 'both' || viewMode === 'chart') && (
            <div style={{ background: '#fff', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 1rem 0', color: '#1e293b' }}>Volunteer Volume by Continent</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {byContinent.map((cont: any) => {
                  const maxCount = byContinent[0]?.volunteerCount || 1;
                  const pctWidth = Math.max(5, Math.round((cont.volunteerCount / maxCount) * 100));
                  return (
                    <div key={cont.continent} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem' }}>
                      <div style={{ width: '120px', fontWeight: '500' }}>{cont.continent}</div>
                      <div style={{ flex: 1, backgroundColor: '#f1f5f9', borderRadius: '4px', height: '24px', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ width: `${pctWidth}%`, backgroundColor: '#10b981', height: '100%', borderRadius: '4px' }} />
                        <span style={{ position: 'absolute', left: '8px', top: '3px', fontSize: '0.75rem', fontWeight: '600', color: pctWidth > 20 ? '#fff' : '#0f172a' }}>
                          {cont.volunteerCount} ({cont.sharePercent}%)
                        </span>
                      </div>
                      <div style={{ width: '80px', textAlign: 'right', fontSize: '0.8rem', color: '#f59e0b', fontWeight: '600' }}>
                        {cont.averageRating ? `${cont.averageRating.toFixed(2)} ★` : '—'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {(viewMode === 'both' || viewMode === 'table') && (
            <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                    <th onClick={() => handleSort('continent')} style={{ padding: '0.6rem 0.75rem', cursor: 'pointer', userSelect: 'none' }}>
                      Continent {renderSortIndicator('continent')}
                    </th>
                    <th onClick={() => handleSort('volunteerCount')} style={{ padding: '0.6rem 0.75rem', textAlign: 'right', cursor: 'pointer', userSelect: 'none' }}>
                      Volunteers {renderSortIndicator('volunteerCount')}
                    </th>
                    <th onClick={() => handleSort('sharePercent')} style={{ padding: '0.6rem 0.75rem', textAlign: 'right', cursor: 'pointer', userSelect: 'none' }}>
                      Share {renderSortIndicator('sharePercent')}
                    </th>
                    <th onClick={() => handleSort('averageRating')} style={{ padding: '0.6rem 0.75rem', textAlign: 'right', cursor: 'pointer', userSelect: 'none' }}>
                      Average Rating {renderSortIndicator('averageRating')}
                    </th>
                    <th onClick={() => handleSort('ratingCount')} style={{ padding: '0.6rem 0.75rem', textAlign: 'right', cursor: 'pointer', userSelect: 'none' }}>
                      Rated Stays {renderSortIndicator('ratingCount')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedContinentData.map((cont: any) => (
                    <tr key={cont.continent} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.5rem 0.75rem', fontWeight: '500' }}>{cont.continent}</td>
                      <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', fontWeight: '600' }}>{cont.volunteerCount}</td>
                      <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', color: '#64748b' }}>{cont.sharePercent}%</td>
                      <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', fontWeight: '600', color: '#d97706' }}>
                        {cont.averageRating ? `${cont.averageRating.toFixed(2)} ★` : '—'}
                      </td>
                      <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', color: '#64748b' }}>{cont.ratingCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: BY AGE BRACKET */}
      {activeTab === 'age' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {(viewMode === 'both' || viewMode === 'chart') && (
            <div style={{ background: '#fff', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 1rem 0', color: '#1e293b' }}>Average Star Rating by Age Group</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
                {byAgeBracket.map((b: any) => (
                  <div key={b.bracket} style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '6px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#334155' }}>Age {b.bracket}</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#d97706', margin: '0.35rem 0' }}>
                      {b.averageRating ? `${b.averageRating.toFixed(2)} ★` : '—'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{b.volunteerCount} volunteers</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(viewMode === 'both' || viewMode === 'table') && (
            <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                    <th onClick={() => handleSort('bracket')} style={{ padding: '0.6rem 0.75rem', cursor: 'pointer', userSelect: 'none' }}>
                      Age Bracket {renderSortIndicator('bracket')}
                    </th>
                    <th onClick={() => handleSort('volunteerCount')} style={{ padding: '0.6rem 0.75rem', textAlign: 'right', cursor: 'pointer', userSelect: 'none' }}>
                      Volunteers {renderSortIndicator('volunteerCount')}
                    </th>
                    <th onClick={() => handleSort('averageRating')} style={{ padding: '0.6rem 0.75rem', textAlign: 'right', cursor: 'pointer', userSelect: 'none' }}>
                      Average Rating {renderSortIndicator('averageRating')}
                    </th>
                    <th onClick={() => handleSort('ratingCount')} style={{ padding: '0.6rem 0.75rem', textAlign: 'right', cursor: 'pointer', userSelect: 'none' }}>
                      Rated Stays {renderSortIndicator('ratingCount')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedAgeData.map((b: any) => (
                    <tr key={b.bracket} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.5rem 0.75rem', fontWeight: '500' }}>Age {b.bracket}</td>
                      <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', fontWeight: '600' }}>{b.volunteerCount}</td>
                      <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', fontWeight: '600', color: '#d97706' }}>
                        {b.averageRating ? `${b.averageRating.toFixed(2)} ★` : '—'}
                      </td>
                      <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', color: '#64748b' }}>{b.ratingCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: BY GENDER */}
      {activeTab === 'gender' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {(viewMode === 'both' || viewMode === 'chart') && (
            <div style={{ background: '#fff', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 1rem 0', color: '#1e293b' }}>Demographics & Performance by Gender</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
                {byGender.map((g: any) => (
                  <div key={g.gender} style={{ backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '6px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>
                      {g.gender === 'Male' ? '♂' : g.gender === 'Female' ? '♀' : g.gender === 'Neutral' ? '⚧' : '⚪'}
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#0f172a' }}>{g.gender}</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#2563eb', margin: '0.35rem 0' }}>
                      {g.volunteerCount} <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'normal' }}>({g.sharePercent}%)</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#d97706', fontWeight: '600' }}>
                      {g.averageRating ? `${g.averageRating.toFixed(2)} ★` : '—'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(viewMode === 'both' || viewMode === 'table') && (
            <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                    <th onClick={() => handleSort('gender')} style={{ padding: '0.6rem 0.75rem', cursor: 'pointer', userSelect: 'none' }}>
                      Gender {renderSortIndicator('gender')}
                    </th>
                    <th onClick={() => handleSort('volunteerCount')} style={{ padding: '0.6rem 0.75rem', textAlign: 'right', cursor: 'pointer', userSelect: 'none' }}>
                      Volunteers {renderSortIndicator('volunteerCount')}
                    </th>
                    <th onClick={() => handleSort('sharePercent')} style={{ padding: '0.6rem 0.75rem', textAlign: 'right', cursor: 'pointer', userSelect: 'none' }}>
                      Share {renderSortIndicator('sharePercent')}
                    </th>
                    <th onClick={() => handleSort('averageRating')} style={{ padding: '0.6rem 0.75rem', textAlign: 'right', cursor: 'pointer', userSelect: 'none' }}>
                      Average Rating {renderSortIndicator('averageRating')}
                    </th>
                    <th onClick={() => handleSort('ratingCount')} style={{ padding: '0.6rem 0.75rem', textAlign: 'right', cursor: 'pointer', userSelect: 'none' }}>
                      Rated Stays {renderSortIndicator('ratingCount')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedGenderData.map((g: any) => (
                    <tr key={g.gender} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.5rem 0.75rem', fontWeight: '500' }}>{g.gender}</td>
                      <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', fontWeight: '600' }}>{g.volunteerCount}</td>
                      <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', color: '#64748b' }}>{g.sharePercent}%</td>
                      <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', fontWeight: '600', color: '#d97706' }}>
                        {g.averageRating ? `${g.averageRating.toFixed(2)} ★` : '—'}
                      </td>
                      <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', color: '#64748b' }}>{g.ratingCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: REHIRE RATIOS */}
      {activeTab === 'rehire' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {(viewMode === 'both' || viewMode === 'chart') && (
            <div style={{ background: '#fff', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 1rem 0', color: '#1e293b' }}>Rehire Recommendation Distribution by Country</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {byCountry.slice(0, 10).map((c: any) => {
                  const r = rehireRatiosByCountry.find((item: any) => item.country === c.country) || {
                    country: c.country,
                    acceptPercent: 0,
                    possiblePercent: 0,
                    doNotAcceptPercent: 0,
                    acceptCount: 0,
                    possibleCount: 0,
                    doNotAcceptCount: 0
                  };
                  return (
                    <div key={c.country} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem' }}>
                      <div style={{ width: '80px', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: '500' }}>
                        <CountryFlag countryCode={c.country} />
                        <span>{c.country}</span>
                      </div>
                      {/* Stacked Percentage Bar */}
                      <div style={{ flex: 1, display: 'flex', height: '22px', borderRadius: '4px', overflow: 'hidden', backgroundColor: '#f1f5f9' }}>
                        {r.acceptPercent > 0 && (
                          <div style={{ width: `${r.acceptPercent}%`, backgroundColor: '#10b981' }} title={`Accept: ${r.acceptPercent}% (${r.acceptCount})`} />
                        )}
                        {r.possiblePercent > 0 && (
                          <div style={{ width: `${r.possiblePercent}%`, backgroundColor: '#f59e0b' }} title={`Possible: ${r.possiblePercent}% (${r.possibleCount})`} />
                        )}
                        {r.doNotAcceptPercent > 0 && (
                          <div style={{ width: `${r.doNotAcceptPercent}%`, backgroundColor: '#ef4444' }} title={`Do Not Accept: ${r.doNotAcceptPercent}% (${r.doNotAcceptCount})`} />
                        )}
                      </div>
                      <div style={{ width: '90px', textAlign: 'right', fontSize: '0.75rem', fontWeight: '600' }}>
                        <span style={{ color: '#10b981' }}>{r.acceptPercent}%</span> Accept
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {(viewMode === 'both' || viewMode === 'table') && (
            <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                    <th onClick={() => handleSort('country')} style={{ padding: '0.6rem 0.75rem', cursor: 'pointer', userSelect: 'none' }}>
                      Country {renderSortIndicator('country')}
                    </th>
                    <th onClick={() => handleSort('totalReviews')} style={{ padding: '0.6rem 0.75rem', textAlign: 'right', cursor: 'pointer', userSelect: 'none' }}>
                      Total Reviews {renderSortIndicator('totalReviews')}
                    </th>
                    <th onClick={() => handleSort('acceptPercent')} style={{ padding: '0.6rem 0.75rem', textAlign: 'right', color: '#16a34a', cursor: 'pointer', userSelect: 'none' }}>
                      Accept % {renderSortIndicator('acceptPercent')}
                    </th>
                    <th onClick={() => handleSort('possiblePercent')} style={{ padding: '0.6rem 0.75rem', textAlign: 'right', color: '#d97706', cursor: 'pointer', userSelect: 'none' }}>
                      Possible % {renderSortIndicator('possiblePercent')}
                    </th>
                    <th onClick={() => handleSort('doNotAcceptPercent')} style={{ padding: '0.6rem 0.75rem', textAlign: 'right', color: '#dc2626', cursor: 'pointer', userSelect: 'none' }}>
                      Do Not Accept % {renderSortIndicator('doNotAcceptPercent')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedRehireData.map((r: any) => (
                    <tr key={r.country} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '500' }}>
                        <CountryFlag countryCode={r.country} />
                        <span>{r.country}</span>
                      </td>
                      <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', fontWeight: '600' }}>{r.totalReviews}</td>
                      <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', color: '#16a34a', fontWeight: '500' }}>
                        {r.acceptCount} ({r.acceptPercent}%)
                      </td>
                      <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', color: '#d97706' }}>
                        {r.possibleCount} ({r.possiblePercent}%)
                      </td>
                      <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', color: '#dc2626' }}>
                        {r.doNotAcceptCount} ({r.doNotAcceptPercent}%)
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
