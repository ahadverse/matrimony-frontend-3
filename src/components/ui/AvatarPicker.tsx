'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, Trash2, UserRound } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

/**
 * The single profile photo asked for on the registration wizard's first screen.
 *
 * It holds a `File`, not a URL: photos hang off the profile row, and the profile
 * cannot be created until a name exists — which is the *second* screen. So the
 * wizard keeps the file in memory here and uploads it once the profile is
 * saved. Extra photos are added later from the profile's photo tab.
 */
export function AvatarPicker({
  file,
  onChange,
  label,
  hint,
}: {
  file: File | null;
  onChange: (file: File | null) => void;
  label: string;
  hint?: string;
}) {
  const { t } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          aria-label={label}
          className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-faint)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="h-full w-full object-cover" />
          ) : (
            <UserRound size={34} />
          )}
        </button>

        <span className="gradient-primary pointer-events-none absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-on-primary)]">
          <Camera size={15} />
        </span>
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="text-sm font-medium text-[var(--color-primary-accent)] hover:underline"
      >
        {file ? t('auth.register.avatarChange') : label}
      </button>

      {file && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="flex items-center gap-1 text-xs text-[var(--color-text-faint)] hover:text-[var(--color-danger)]"
        >
          <Trash2 size={12} />
          {t('auth.register.avatarRemove')}
        </button>
      )}

      {hint && !file && (
        <p className="text-center text-xs text-[var(--color-text-faint)]">{hint}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          onChange(e.target.files?.[0] ?? null);
          // Cleared so re-picking the same file still fires a change event.
          e.target.value = '';
        }}
      />
    </div>
  );
}
