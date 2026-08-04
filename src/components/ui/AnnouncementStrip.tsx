'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import { api } from '@/lib/api-client';

const MESSAGE_KEYS = [
  'announce.guardianMode',
  'announce.verifiedProfiles',
  'announce.safety',
];

const ROTATE_MS = 5000;

export function AnnouncementStrip() {
  const { t, locale, setLocale } = useLanguage();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % MESSAGE_KEYS.length), ROTATE_MS);
    return () => clearInterval(id);
  }, []);

  function toggleLocale() {
    const next = locale === 'en' ? 'bn' : 'en';
    setLocale(next);
    api.patch('users/me/language', { languagePref: next }).catch(() => {});
  }

  return (
    <div className="gradient-primary text-[var(--color-on-primary)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 text-xs font-medium sm:text-sm">
        <div className="flex items-center gap-2">
          <span>{t(MESSAGE_KEYS[index])}</span>
          <span className="hidden items-center gap-1 sm:flex">
            {MESSAGE_KEYS.map((key, i) => (
              <span
                key={key}
                className={`h-1.5 w-1.5 rounded-full ${
                  i === index ? 'bg-[var(--color-gold)]' : 'bg-[var(--color-on-primary)]/40'
                }`}
              />
            ))}
          </span>
        </div>
        <button
          type="button"
          onClick={toggleLocale}
          className="rounded-full bg-[var(--color-on-primary)]/15 px-2.5 py-1 text-[11px] font-semibold hover:bg-[var(--color-on-primary)]/25"
        >
          {locale === 'en' ? 'EN | বাং' : 'বাং | EN'}
        </button>
      </div>
    </div>
  );
}
