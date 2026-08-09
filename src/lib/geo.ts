/**
 * Country / state / city data served as static JSON from `public/geo`, generated
 * by `scripts/build-geo.mjs`.
 *
 * Data by Countries States Cities Database
 * https://github.com/dr5hn/countries-states-cities-database | ODbL v1.0
 */

export interface GeoCountry {
  iso2: string;
  name: string;
  emoji: string;
  phonecode: string;
}

export interface GeoState {
  /** Equal to `name` — see the note in scripts/build-geo.mjs. */
  code: string;
  name: string;
}

/** The location fields carried on a profile. */
export interface ProfileLocation {
  country: string;
  countryCode: string;
  state: string;
  city: string;
  zip: string;
}

export const EMPTY_LOCATION: ProfileLocation = {
  country: '',
  countryCode: '',
  state: '',
  city: '',
  zip: '',
};

type PartialLocation = Partial<Record<keyof ProfileLocation, string | null | undefined>> & {
  /** Pre-worldwide profiles that only ever had the Bangladesh pair. */
  district?: string | null;
  subDistrict?: string | null;
};

/**
 * Short form for cards and lists — "Savar, Dhaka".
 *
 * Falls back to the legacy district/subDistrict pair so rows written before the
 * worldwide fields existed still render something instead of an empty line.
 */
export function formatLocation(loc: PartialLocation | null | undefined): string {
  if (!loc) return '';
  const city = loc.city || loc.subDistrict;
  const state = loc.state || loc.district;
  return [city, state].filter(Boolean).join(', ');
}

/** Long form for the profile detail page — "Savar, Dhaka, Bangladesh". */
export function formatLocationFull(loc: PartialLocation | null | undefined): string {
  if (!loc) return '';
  const city = loc.city || loc.subDistrict;
  const state = loc.state || loc.district;
  return [city, state, loc.country].filter(Boolean).join(', ');
}
