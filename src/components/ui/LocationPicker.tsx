'use client';

import { useMemo } from 'react';
import { Input } from '@/components/ui/Input';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { useCities, useCountries, useStates } from '@/lib/queries';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import type { ProfileLocation } from '@/lib/geo';

interface LocationPickerProps {
  value: ProfileLocation;
  onChange: (next: ProfileLocation) => void;
  /** Marks country/state/city as required. ZIP is always optional. */
  required?: boolean;
  /** Off for the browse filter, where a postcode is not a useful filter. */
  showZip?: boolean;
  /** Prefixed onto each field wrapper's id, so `?field=` deep-links can scroll to it. */
  idPrefix?: string;
}

/**
 * The country → state → city cascade plus a free-text ZIP, used everywhere a
 * location is entered (registration, edit profile, browse filters) so the reset
 * rules live in one place.
 *
 * The country's whole city list arrives in a single file, so once a country is
 * chosen, switching states costs no further requests.
 */
export function LocationPicker({ value, onChange, required, showZip = true, idPrefix }: LocationPickerProps) {
  const { t } = useLanguage();

  const { data: countries } = useCountries();

  // The code can be missing while the name is present — a profile saved before
  // worldwide locations existed, or a filter restored from a URL that only
  // carries the country name. Recovering it from the name keeps the cascade
  // working instead of dead-ending at an empty state list.
  const countryCode = useMemo(
    () => value.countryCode || countries?.find((c) => c.name === value.country)?.iso2 || '',
    [countries, value.countryCode, value.country],
  );

  const { data: states } = useStates(countryCode || null);
  const { data: cities } = useCities(countryCode || null, value.state || '');

  const countryNames = useMemo(() => countries?.map((c) => `${c.emoji} ${c.name}`.trim()) ?? [], [countries]);
  const stateNames = useMemo(() => states?.map((s) => s.name) ?? [], [states]);

  // A country is displayed with its flag but stored as a plain name, so the two
  // are mapped rather than string-sliced.
  const selectedCountryLabel = useMemo(() => {
    const match = countries?.find((c) => c.name === value.country);
    return match ? `${match.emoji} ${match.name}`.trim() : value.country;
  }, [countries, value.country]);

  // 21 countries have no states upstream, and a handful of states have no city
  // list. Rather than dead-end the form, the city falls back to free text.
  const hasStates = stateNames.length > 0;
  const cityOptions = cities ?? [];
  const cityIsFreeText = !!countryCode && (hasStates ? !!value.state : true) && cityOptions.length === 0;

  function selectCountry(label: string) {
    const match = countries?.find((c) => `${c.emoji} ${c.name}`.trim() === label);
    // Changing country invalidates everything below it.
    onChange({
      ...value,
      country: match?.name ?? '',
      countryCode: match?.iso2 ?? '',
      state: '',
      city: '',
    });
  }

  function selectState(next: string) {
    onChange({ ...value, state: next, city: '' });
  }

  const id = (field: string) => (idPrefix ? `${idPrefix}-${field}` : undefined);

  return (
    <>
      <div id={id('country')}>
        <SearchableSelect
          label={t('auth.register.country')}
          required={required}
          placeholder={t('auth.register.selectCountry')}
          value={selectedCountryLabel}
          onChange={selectCountry}
          options={countryNames}
        />
      </div>

      {hasStates && (
        <div id={id('state')}>
          <SearchableSelect
            label={t('auth.register.state')}
            required={required}
            placeholder={t('auth.register.selectState')}
            value={value.state}
            onChange={selectState}
            options={stateNames}
            disabled={!countryCode}
          />
        </div>
      )}

      <div id={id('city')}>
        {cityIsFreeText ? (
          <Input
            label={t('auth.register.city')}
            required={required}
            placeholder={t('auth.register.cityPlaceholder')}
            value={value.city}
            maxLength={80}
            onChange={(e) => onChange({ ...value, city: e.target.value })}
          />
        ) : (
          <SearchableSelect
            label={t('auth.register.city')}
            required={required}
            placeholder={t('auth.register.selectCity')}
            value={value.city}
            onChange={(next) => onChange({ ...value, city: next })}
            options={cityOptions}
            disabled={!countryCode || (hasStates && !value.state)}
          />
        )}
      </div>

      {showZip && (
        <div id={id('zip')}>
          <Input
            label={t('auth.register.zip')}
            placeholder={t('auth.register.zipPlaceholder')}
            value={value.zip}
            maxLength={20}
            onChange={(e) => onChange({ ...value, zip: e.target.value })}
          />
        </div>
      )}
    </>
  );
}
