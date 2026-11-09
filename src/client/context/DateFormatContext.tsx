import React, { createContext, useContext, useState, useEffect } from 'react';
import { formatDateWithPreference, formatDateWithDay } from '../utils/date-utils';

export type DateFormatPreference = 'YYYY-MM-DD' | 'DD-MM-YYYY';

interface DateFormatContextType {
  dateFormatPreference: DateFormatPreference;
  setDateFormatPreference: (pref: DateFormatPreference) => void;
  formatDate: (input: string | Date | null | undefined, includeDay?: boolean) => string;
}

const DateFormatContext = createContext<DateFormatContextType>({
  dateFormatPreference: 'YYYY-MM-DD',
  setDateFormatPreference: () => {},
  formatDate: (input) => (input ? String(input) : '')
});

export const DateFormatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preference, setPreference] = useState<DateFormatPreference>(() => {
    return (localStorage.getItem('date_format_preference') as DateFormatPreference) || 'YYYY-MM-DD';
  });

  const fetchPreference = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (data?.dateFormatPreference) {
        setPreference(data.dateFormatPreference);
        localStorage.setItem('date_format_preference', data.dateFormatPreference);
      }
    } catch (e) {
      // Ignore
    }
  };

  useEffect(() => {
    fetchPreference();
  }, []);

  const setDateFormatPreference = (pref: DateFormatPreference) => {
    setPreference(pref);
    localStorage.setItem('date_format_preference', pref);
  };

  const formatDate = (input: string | Date | null | undefined, includeDay: boolean = false) => {
    if (!input) return '';
    return includeDay
      ? formatDateWithDay(input, preference)
      : formatDateWithPreference(input, preference);
  };

  return (
    <DateFormatContext.Provider value={{ dateFormatPreference: preference, setDateFormatPreference, formatDate }}>
      {children}
    </DateFormatContext.Provider>
  );
};

export const useDateFormat = () => useContext(DateFormatContext);
