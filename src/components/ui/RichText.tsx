'use client';

import { Fragment, type ReactNode } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

/**
 * A translated sentence with React nodes dropped into its `{placeholders}`.
 *
 * `t()` interpolates strings only, so a legal notice like "I accept the {terms}
 * and {privacy}" could not carry its own links — splitting the sentence in the
 * component instead would hard-code English word order and break in Bangla.
 * This keeps the whole sentence in the translation file and substitutes the
 * links wherever that language happens to put them.
 */
export function RichText({
  tKey,
  values,
}: {
  tKey: string;
  values: Record<string, ReactNode>;
}) {
  const { t } = useLanguage();
  const template = t(tKey);

  // Split on the placeholders while keeping them, so the odd indices are the
  // captured names and the even ones are the literal text between them.
  const parts = template.split(/\{(\w+)\}/g);

  return (
    <>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <Fragment key={index}>{values[part] ?? `{${part}}`}</Fragment>
        ) : (
          <Fragment key={index}>{part}</Fragment>
        ),
      )}
    </>
  );
}
