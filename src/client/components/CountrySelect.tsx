import React, { useState, useRef, useEffect } from 'react';
import { COUNTRIES, getCountryByCode } from '../data/countries';
import { CountryFlag } from './CountryFlag';

interface CountrySelectProps {
  value: string;
  onChange: (countryCode: string) => void;
  style?: React.CSSProperties;
}

export const CountrySelect: React.FC<CountrySelectProps> = ({ value, onChange, style }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedCountry = getCountryByCode(value);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const filteredCountries = COUNTRIES.filter(c => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q);
  });

  const handleSelect = (code: string) => {
    onChange(code);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', ...style }}>
      {/* Trigger Button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.5rem 0.75rem',
          borderRadius: '4px',
          border: '1px solid #d4d4d8',
          backgroundColor: '#fff',
          cursor: 'pointer',
          fontSize: '0.95rem',
          minHeight: '38px',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
          {selectedCountry ? (
            <>
              <CountryFlag countryCode={selectedCountry.code} style={{ fontSize: '1.25rem' }} />
              <span style={{ fontWeight: '500', color: '#18181b', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {selectedCountry.name} ({selectedCountry.code})
              </span>
            </>
          ) : (
            <span style={{ color: '#a1a1aa' }}>Select country or territory...</span>
          )}
        </div>
        <span style={{ fontSize: '0.75rem', color: '#71717a', marginLeft: '0.5rem' }}>
          {isOpen ? '▲' : '▼'}
        </span>
      </div>

      {/* Dropdown Panel with Search */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            backgroundColor: '#fff',
            borderRadius: '6px',
            border: '1px solid #d4d4d8',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 2000,
            maxHeight: '280px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Search Filter Input */}
          <div style={{ padding: '0.5rem', borderBottom: '1px solid #e4e4e7', backgroundColor: '#f8fafc' }}>
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍 Search country name or code..."
              style={{
                width: '100%',
                padding: '0.4rem 0.6rem',
                borderRadius: '4px',
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem',
                boxSizing: 'border-box'
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setIsOpen(false);
              }}
            />
          </div>

          {/* Scrollable Countries List */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {filteredCountries.length > 0 ? (
              filteredCountries.map(c => {
                const isSelected = value?.toUpperCase() === c.code;
                return (
                  <div
                    key={c.code}
                    onClick={() => handleSelect(c.code)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.5rem 0.75rem',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      backgroundColor: isSelected ? '#eff6ff' : 'transparent',
                      borderBottom: '1px solid #f4f4f5'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) (e.currentTarget as HTMLElement).style.backgroundColor = '#f8fafc';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <CountryFlag countryCode={c.code} style={{ fontSize: '1.25rem' }} />
                      <span style={{ color: isSelected ? '#1e40af' : '#18181b', fontWeight: isSelected ? '600' : 'normal' }}>
                        {c.name}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '500' }}>
                      {c.code}
                    </span>
                  </div>
                );
              })
            ) : (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                No country found matching "{search}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
