import React, { useEffect, useState } from 'react';
import { CountryFlag } from '../components/CountryFlag';

export const AdminReportsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'country' | 'continent' | 'age' | 'gender' | 'rehire'>('country');
  const [viewMode, setViewMode] = useState<'both' | 'chart' | 'table'>('both');

  useEffect(() => {
    fetch('/api/admin/reports')
      .then(res => res.json())
      .then(d => setData(d))
      .catch(err => console.error('Failed to load reports:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading analytics and reports...</div>;
  }

  if (!data) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: '#ef4444' }}>Failed to load reports data.</div>;
  }

  const { kpis, byCountry, byContinent, byAgeBracket, byGender, rehireRatiosByCountry } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', maxWidth: '1100px' }}>
      {/* Header */}
      <div>
        <h2 style={{ margin: '0 0 0.25rem 0' }}>Volunteer Analytics & Reports</h2>
        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
          Historical staffing statistics, demographic crosstabulations, star ratings, and rehire distributions.
        </span>
      </div>

      {/* KPI Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div style={{ background: '#fff', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Total Volunteers</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#0f172a', marginTop: '0.25rem' }}>{kpis.totalVolunteers}</div>
          <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.25rem' }}>Recorded in database</div>
        </div>

        <div style={{ background: '#fff', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Total Stays</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#0f172a', marginTop: '0.25rem' }}>{kpis.totalStays}</div>
          <div style={{ fontSize: '0.75rem', color: '#3b82f6', marginTop: '0.25rem' }}>Past and active stays</div>
        </div>

        <div style={{ background: '#fff', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Average Rating</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#0f172a', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span>{kpis.averageRating.toFixed(2)}</span>
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
              onClick={() => setActiveTab(tab.id as any)}
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
                    <th style={{ padding: '0.6rem 0.75rem' }}>Country</th>
                    <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>Volunteers</th>
                    <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>Share</th>
                    <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>Avg Rating</th>
                    <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>Rated Stays</th>
                    <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>Rehire Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {byCountry.map((c: any) => (
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
                    <th style={{ padding: '0.6rem 0.75rem' }}>Continent</th>
                    <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>Volunteers</th>
                    <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>Share</th>
                    <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>Average Rating</th>
                    <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>Rated Stays</th>
                  </tr>
                </thead>
                <tbody>
                  {byContinent.map((cont: any) => (
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
                    <th style={{ padding: '0.6rem 0.75rem' }}>Age Bracket</th>
                    <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>Volunteers</th>
                    <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>Average Rating</th>
                    <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>Rated Stays</th>
                  </tr>
                </thead>
                <tbody>
                  {byAgeBracket.map((b: any) => (
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
                    <th style={{ padding: '0.6rem 0.75rem' }}>Gender</th>
                    <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>Volunteers</th>
                    <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>Share</th>
                    <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>Average Rating</th>
                    <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>Rated Stays</th>
                  </tr>
                </thead>
                <tbody>
                  {byGender.map((g: any) => (
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
                {rehireRatiosByCountry.slice(0, 10).map((r: any) => (
                  <div key={r.country} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem' }}>
                    <div style={{ width: '80px', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: '500' }}>
                      <CountryFlag countryCode={r.country} />
                      <span>{r.country}</span>
                    </div>
                    {/* Stacked Percentage Bar */}
                    <div style={{ flex: 1, display: 'flex', height: '22px', borderRadius: '4px', overflow: 'hidden' }}>
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
                ))}
              </div>
            </div>
          )}

          {(viewMode === 'both' || viewMode === 'table') && (
            <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Country</th>
                    <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>Total Reviews</th>
                    <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right', color: '#16a34a' }}>Accept</th>
                    <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right', color: '#d97706' }}>Possible</th>
                    <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right', color: '#dc2626' }}>Do Not Accept</th>
                  </tr>
                </thead>
                <tbody>
                  {rehireRatiosByCountry.map((r: any) => (
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
