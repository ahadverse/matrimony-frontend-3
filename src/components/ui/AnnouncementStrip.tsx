'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

const MESSAGE_KEYS = [
  'announce.guardianMode',
  'announce.verifiedProfiles',
  'announce.safety',
];

const ROTATE_MS = 5000;

export function AnnouncementStrip() {
  const { t } = useLanguage();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % MESSAGE_KEYS.length), ROTATE_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="gradient-primary text-[var(--color-on-primary)]">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-4 px-4 py-2 text-xs font-medium sm:text-sm">
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
      </div>
    </div>
  );
}
