const CM_PER_INCH = 2.54;

export function cmToFeetInches(cm: number): { feet: number; inches: number } {
  const totalInches = Math.round(cm / CM_PER_INCH);
  return { feet: Math.floor(totalInches / 12), inches: totalInches % 12 };
}

export function feetInchesToCm(feet: number, inches: number): number {
  return Math.round((feet * 12 + inches) * CM_PER_INCH);
}

/**
 * English-only height label. Prefer `useFormatHeight` in anything a member
 * sees — "feet" and "inch" are words, and the app runs in Bangla. This stays
 * for non-UI callers and as the fallback shape.
 */
export function formatHeight(cm: number | null | undefined): string | null {
  if (cm == null) return null;
  const { feet, inches } = cmToFeetInches(cm);
  return `${feet} feet ${inches} inch`;
}
