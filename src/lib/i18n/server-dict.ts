import bn from '@/messages/bn.json';
import en from '@/messages/en.json';

/**
 * The dictionary for server components.
 *
 * Server components cannot call `useLanguage`, so the marketing layouts and the
 * landing page were importing `messages/en.json` directly and reading straight
 * out of it. That renders English no matter what the reader's locale is — and
 * since `LanguageProvider` pins the app to Bangla, "no matter what" meant
 * always. Whole sections of the register, FAQ, how-it-works, assistance and
 * directory pages stayed in English however complete `bn.json` was.
 *
 * Importing this instead keeps that prose in the static HTML (which is why it
 * was written server-side — it is what crawlers read) while actually being in
 * the language the site runs in.
 *
 * Keys missing from `bn.json` fall back to English one key at a time, matching
 * what `t()` does on the client.
 */
type Dict = typeof en;

function withEnglishFallback(bangla: unknown, english: unknown): unknown {
  if (typeof english !== 'object' || english === null) {
    return bangla === undefined || bangla === null ? english : bangla;
  }
  if (typeof bangla !== 'object' || bangla === null) return english;

  const merged: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(english as Record<string, unknown>)) {
    merged[key] = withEnglishFallback((bangla as Record<string, unknown>)[key], value);
  }
  return merged;
}

export const dict = withEnglishFallback(bn, en) as Dict;

/** The raw English dictionary, for the few places that genuinely want it — SEO metadata aimed at English-language search. */
export const enDict = en;
