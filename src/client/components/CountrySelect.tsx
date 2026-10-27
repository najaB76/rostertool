import React from 'react';
import { COUNTRIES } from '../data/countries';

interface CountrySelectProps {
  value: string;
  onChange: (countryCode: string) => void;
  style?: React.CSSProperties;
}

export const CountrySelect: React.FC<CountrySelectProps> = ({ value, onChange, style }) => {
  return (
    <select
      value={value.toUpperCase()}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: '100%',
        padding: '0.5rem',
        borderRadius: '4px',
        border: '1px solid #d4d4d8',
        backgroundColor: '#fff',
        fontSize: '0.95rem',
        ...style
      }}
    >
      <option value="">-- Select Country --</option>
      {COUNTRIES.map((c) => (
        <option key={c.code} value={c.code}>
          {c.flag} {c.name} ({c.code})
        </option>
      ))}
    </select>
  );
};
