/**
 * Example national mobile numbers, keyed by ISO-2, used as the placeholder in
 * `PhoneInput` so the hint matches the country the member actually picked.
 *
 * Hand-maintained rather than pulled from `libphonenumber-js/examples.mobile`:
 * that file is ~150KB of metadata to render one greyed-out string, which is a
 * poor trade on a registration screen people load once. The list covers the
 * countries the directory features plus the main destinations members write in
 * from; `exampleNumberFor` returns `undefined` for anything else, and the field
 * then shows no placeholder at all. That is deliberate — an example in the
 * wrong shape for your country is worse than none, since people type to match
 * it.
 *
 * Digits are the internationally reserved "example number" ranges where one
 * exists for the country, so none of these is a real subscriber's line.
 * Spacing follows how each country groups its own numbers.
 */
const EXAMPLE_NUMBERS: Record<string, string> = {
  AE: '50 123 4567',
  AT: '664 123456',
  AU: '412 345 678',
  BD: '1712 345678',
  BE: '470 12 34 56',
  BH: '3600 1234',
  BR: '11 96123 4567',
  CA: '204 234 5678',
  CH: '78 123 45 67',
  CN: '131 2345 6789',
  CZ: '601 123 456',
  DE: '1512 3456789',
  DK: '32 12 34 56',
  EG: '100 123 4567',
  ES: '612 34 56 78',
  FI: '41 2345678',
  FR: '6 12 34 56 78',
  GB: '7400 123456',
  GR: '691 234 5678',
  ID: '812 345 678',
  IE: '85 012 3456',
  IN: '81234 56789',
  IQ: '791 234 5678',
  IT: '312 345 6789',
  JO: '7 9012 3456',
  JP: '90 1234 5678',
  KR: '10 1234 5678',
  KW: '500 12345',
  LB: '71 123 456',
  LK: '71 234 5678',
  MV: '771 2345',
  MX: '222 123 4567',
  MY: '12 345 6789',
  NL: '6 12345678',
  NO: '406 12 345',
  NP: '984 1234567',
  NZ: '21 123 4567',
  OM: '9212 3456',
  PH: '905 123 4567',
  PK: '301 2345678',
  PL: '512 345 678',
  PT: '912 345 678',
  QA: '3312 3456',
  RU: '912 345 67 89',
  SA: '51 234 5678',
  SE: '70 123 45 67',
  SG: '8123 4567',
  TH: '81 234 5678',
  TR: '501 234 56 78',
  US: '201 555 0123',
  ZA: '71 123 4567',
};

export function exampleNumberFor(iso2: string | null | undefined): string | undefined {
  return iso2 ? EXAMPLE_NUMBERS[iso2.toUpperCase()] : undefined;
}
