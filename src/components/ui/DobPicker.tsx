'use client';

import { useEffect, useState } from 'react';
import { Select } from './Select';

interface DobPickerProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  locale?: 'en' | 'bn';
  dayPlaceholder?: string;
  monthPlaceholder?: string;
  yearPlaceholder?: string;
  minAge?: number;
  maxAge?: number;
  required?: boolean;
}

function daysInMonth(month: number, year: number) {
  return new Date(year, month, 0).getDate();
}

function monthNames(locale: 'en' | 'bn') {
  const formatter = new Intl.DateTimeFormat(locale === 'bn' ? 'bn-BD' : 'en-US', { month: 'long' });
  return Array.from({ length: 12 }, (_, i) => formatter.format(new Date(2000, i, 1)));
}

export function DobPicker({
  label,
  value,
  onChange,
  locale = 'en',
  dayPlaceholder = 'Day',
  monthPlaceholder = 'Month',
  yearPlaceholder = 'Year',
  minAge = 18,
  maxAge = 100,
  required,
}: DobPickerProps) {
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');

  useEffect(() => {
    if (!value) {
      setDay('');
      setMonth('');
      setYear('');
      return;
    }
    const [y, m, d] = value.split('-');
    setYear(y ?? '');
    setMonth(m ? String(Number(m)) : '');
    setDay(d ? String(Number(d)) : '');
  }, [value]);

  useEffect(() => {
    if (!day || !month || !year) return;
    const maxDay = daysInMonth(Number(month), Number(year));
    if (Number(day) > maxDay) {
      setDay(String(maxDay));
      onChange(`${year}-${month.padStart(2, '0')}-${String(maxDay).padStart(2, '0')}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year]);

  const currentYear = new Date().getFullYear();
  const maxYear = currentYear - minAge;
  const minYear = currentYear - maxAge;
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i);
  const dayCount = month && year ? daysInMonth(Number(month), Number(year)) : 31;
  const days = Array.from({ length: dayCount }, (_, i) => i + 1);
  const months = monthNames(locale);

  function commit(nextDay: string, nextMonth: string, nextYear: string) {
    if (nextDay && nextMonth && nextYear) {
      onChange(`${nextYear}-${nextMonth.padStart(2, '0')}-${nextDay.padStart(2, '0')}`);
    } else {
      onChange('');
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-[var(--color-text-muted)]">
          {label}
          {required && <span className="text-[var(--color-danger)]"> *</span>}
        </label>
      )}
      <div className="grid grid-cols-3 gap-2">
        <Select
          aria-label={dayPlaceholder}
          placeholder={dayPlaceholder}
          value={day}
          onChange={(e) => {
            setDay(e.target.value);
            commit(e.target.value, month, year);
          }}
        >
          {days.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </Select>
        <Select
          aria-label={monthPlaceholder}
          placeholder={monthPlaceholder}
          value={month}
          onChange={(e) => {
            setMonth(e.target.value);
            commit(day, e.target.value, year);
          }}
        >
          {months.map((name, idx) => (
            <option key={name} value={idx + 1}>
              {name}
            </option>
          ))}
        </Select>
        <Select
          aria-label={yearPlaceholder}
          placeholder={yearPlaceholder}
          value={year}
          onChange={(e) => {
            setYear(e.target.value);
            commit(day, month, e.target.value);
          }}
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}
