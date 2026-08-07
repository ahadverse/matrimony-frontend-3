'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

const MIN_AGE = 1;
const MAX_AGE = 100;
const AGE_OPTIONS = Array.from({ length: MAX_AGE - MIN_AGE + 1 }, (_, i) => MIN_AGE + i);
const DEFAULT_AGE_MIN = 18;
const DEFAULT_AGE_MAX = 40;

// Browse is behind auth (see proxy.ts), so a logged-out search here bounces
// through /login?redirect=/browse?<filters> and lands back on /browse with
// the same filters once signed in — the query string rides along untouched.
//
// "Looking For" isn't wired to a real filter: the browse feed already only
// shows the signed-in user's opposite gender (see swipes.service.ts), so
// there's no backend param for it. It stays here purely for the layout —
// same reason its value is never added to the search params below.
export function HeroMatchFinder() {
  const { t } = useLanguage();
  const router = useRouter();
  const [lookingFor, setLookingFor] = useState('female');
  const [ageMin, setAgeMin] = useState(DEFAULT_AGE_MIN);
  const [ageMax, setAgeMax] = useState(DEFAULT_AGE_MAX);
  const [religion, setReligion] = useState('Islam');
  const [profession, setProfession] = useState('');

  function search() {
    const params = new URLSearchParams();
    params.set('ageMin', String(ageMin));
    params.set('ageMax', String(ageMax));
    if (religion) params.set('religion', religion);
    if (profession) params.set('profession', profession);
    router.push(`/browse?${params.toString()}`);
  }

  return (
    <Card className="mx-auto w-full max-w-4xl p-6 shadow-lg">
      <h2 className="text-center font-display text-2xl text-[var(--color-primary-accent)]">{t('browse.heroTitle')}</h2>

      <div className="mt-5 flex flex-wrap items-end justify-center gap-4">
        <Select label={t('browse.lookingFor')} value={lookingFor} onChange={(e) => setLookingFor(e.target.value)} className="w-32">
          <option value="female">{t('auth.register.female')}</option>
          <option value="male">{t('auth.register.male')}</option>
        </Select>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-[var(--color-text-muted)]">{t('browse.age')}</span>
          <div className="flex items-center gap-2">
            <Select
              value={ageMin}
              onChange={(e) => {
                const next = Number(e.target.value);
                setAgeMin(next);
                setAgeMax((prev) => Math.max(prev, next));
              }}
              className="w-20"
            >
              {AGE_OPTIONS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </Select>
            <span className="text-sm text-[var(--color-text-muted)]">{t('browse.to')}</span>
            <Select value={ageMax} onChange={(e) => setAgeMax(Number(e.target.value))} className="w-20">
              {AGE_OPTIONS.filter((a) => a >= ageMin).map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <Select label={t('profileDetail.religion')} value={religion} onChange={(e) => setReligion(e.target.value)} className="w-36">
          {['Islam', 'Hinduism', 'Christianity', 'Buddhism'].map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </Select>

        <Select
          label={t('profileDetail.profession')}
          placeholder={t('browse.anyProfession')}
          value={profession}
          onChange={(e) => setProfession(e.target.value)}
          className="w-44"
        >
          {['Student', 'Engineer', 'Doctor', 'Teacher', 'Business', 'Govt. Service'].map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </Select>

        <Button size="md" onClick={search}>
          {t('browse.search')}
        </Button>
      </div>

      <p className="mt-4 flex items-center justify-center gap-2 text-xs text-[var(--color-text-faint)]">
        <ShieldCheck size={14} className="text-[var(--color-success)]" />
        {t('browse.heroSubtitle')}
      </p>
    </Card>
  );
}
