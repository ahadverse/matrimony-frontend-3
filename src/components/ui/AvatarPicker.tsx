'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, Loader2, Trash2, UserRound } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

/**
 * The single profile photo asked for on the registration wizard's first screen.
 *
 * It holds a `File`, not a URL: photos hang off the profile row, which cannot
 * exist until the account does. The wizard keeps the file in memory here and
 * uploads it the moment screen one's account is created, before advancing —
 * `uploading` is that upload in flight. Extra photos are added later from the
 * profile's photo tab.
 */
export function AvatarPicker({
  file,
  onChange,
  label,
  hint,
  required,
  uploading = false,
}: {
  file: File | null;
  onChange: (file: File | null) => void;
  label: string;
  hint?: string;
  required?: boolean;
  /** Shows a spinner over the photo and locks it while it is being sent. */
  uploading?: boolean;
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
          disabled={uploading}
          aria-label={label}
          aria-busy={uploading}
          className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-faint)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] disabled:cursor-default"
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="h-full w-full object-cover" />
          ) : (
            <UserRound size={34} />
          )}
        </button>

        {uploading && (
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-surface)_70%,transparent)] text-[var(--color-primary-accent)]">
            <Loader2 size={26} className="animate-spin" />
          </span>
        )}

        <span className="gradient-primary pointer-events-none absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-on-primary)]">
          <Camera size={15} />
        </span>
      </div>

      {uploading ? (
        // Replaces the change/remove controls rather than sitting beside them:
        // the file is already on its way, so neither one can still be honoured.
        <p
          role="status"
          className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-primary-accent)]"
        >
          <Loader2 size={13} className="animate-spin" />
          {t('auth.register.avatarUploading')}
        </p>
      ) : (
        <>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="text-sm font-medium text-[var(--color-primary-accent)] hover:underline"
          >
            {file ? t('auth.register.avatarChange') : label}
            {required && <span className="text-[var(--color-danger)]"> *</span>}
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
        </>
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
