import React from 'react';
import * as Flags from 'country-flag-icons/react/3x2';

interface CountryFlagProps {
  countryCode: string; // ISO 3166-1 alpha-2, e.g. "FR", "US", "DE"
  className?: string;
  style?: React.CSSProperties;
}

export const CountryFlag: React.FC<CountryFlagProps> = ({ countryCode, className = '', style }) => {
  if (!countryCode) return null;
  const code = countryCode.toUpperCase();
  const FlagComponent = (Flags as Record<string, React.ComponentType<any>>)[code];

  if (FlagComponent) {
    return (
      <span className={`country-flag-wrapper ${className}`} style={{ display: 'inline-flex', alignItems: 'center', margin: '0 0.25rem', ...style }} title={code}>
        <FlagComponent 
          style={{ 
            width: '1.25em', 
            height: '0.85em', 
            borderRadius: '2px', 
            boxShadow: '0 0 1px rgba(0,0,0,0.4)',
            objectFit: 'cover'
          }} 
        />
      </span>
    );
  }

  // Graceful SVG Globe fallback for unrecognized code
  return (
    <span 
      className={`country-flag-fallback ${className}`} 
      title={code}
      style={{ display: 'inline-flex', alignItems: 'center', margin: '0 0.25rem', ...style }}
    >
      <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle' }}>
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    </span>
  );
};
