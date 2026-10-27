import React from 'react';

interface CountryFlagProps {
  countryCode: string; // ISO 3166-1 alpha-2
  className?: string;
}

export const CountryFlag: React.FC<CountryFlagProps> = ({ countryCode, className = '' }) => {
  const code = countryCode.toUpperCase();
  // Simple emoji fallback for now. In a full production build, we'd use an SVG sprite.
  const getFlagEmoji = (countryCode: string) => {
    if (!/^[A-Z]{2}$/.test(countryCode)) return '🌐';
    const codePoints = countryCode
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  return (
    <span className={`country-flag ${className}`} title={code}>
      {getFlagEmoji(code)}
    </span>
  );
};
