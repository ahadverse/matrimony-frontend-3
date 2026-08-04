'use client';

import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { BadgeCheck, Camera, Check, Clock, EyeOff, Heart, Shield, Video, XCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useMyVerification, useSubmitVerification } from '@/lib/queries';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import { ApiError } from '@/lib/api-client';
import { MAX_IMAGE_SIZE_MB, validateImageFile } from '@/lib/fileValidation';

export default function VerifySelfiePage() {
  const { t } = useLanguage();
  const { data: verification, isLoading } = useMyVerification();
  const submit = useSubmitVerification();
  const [nidNumber, setNidNumber] = useState('');
  const [selfie, setSelfie] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (isLoading) {
    return <div className="pt-24 text-center text-[var(--color-text-muted)]">{t('common.loading')}</div>;
  }

  if (verification?.status === 'approved') {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-3 pt-16 text-center">
        <BadgeCheck size={48} className="text-[var(--color-primary-accent)]" />
        <h1 className="font-display text-2xl text-[var(--color-text)]">{t('verification.approvedTitle')}</h1>
        <p className="text-sm text-[var(--color-text-muted)]">{t('verification.approvedBody')}</p>
      </div>
    );
  }

  const isValid = /^\d{10}$|^\d{13}$|^\d{17}$/.test(nidNumber.trim()) && !!selfie;

  function handleFileChange(file: File | null) {
    if (!file) {
      setSelfie(null);
      return;
    }
    const result = validateImageFile(file);
    if (!result.ok) {
      toast.error(
        result.reason === 'size'
          ? t('common.imageTooLarge', { size: MAX_IMAGE_SIZE_MB })
          : t('common.imageInvalidType'),
      );
      if (fileInputRef.current) fileInputRef.current.value = '';
      setSelfie(null);
      return;
    }
    setSelfie(file);
  }

  function handleSubmit() {
    if (!nidNumber.trim() || !selfie) return;
    submit.mutate(
      { nidNumber: nidNumber.trim(), selfie },
      {
        onSuccess: () => toast.success(t('verifySelfie.submitted')),
        onError: (e) => toast.error(e instanceof ApiError ? String(e.message) : 'Could not submit verification'),
      },
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="gradient-primary flex flex-col items-center gap-2 rounded-2xl p-10 text-center text-[var(--color-on-primary)]">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-on-primary)]/15">
          <Shield size={28} />
        </span>
        <h1 className="font-display mt-2 text-2xl">{t('verifySelfie.title')}</h1>
        <p className="text-sm text-[var(--color-on-primary)]/80">{t('verifySelfie.subtitle')}</p>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        {[
          { icon: Shield, labelKey: 'verifySelfie.pill1' },
          { icon: EyeOff, labelKey: 'verifySelfie.pill2' },
          { icon: Heart, labelKey: 'verifySelfie.pill3' },
        ].map(({ icon: Icon, labelKey }) => (
          <Card key={labelKey} className="flex flex-col items-center gap-2 p-4 text-center">
            <Icon size={20} className="text-[var(--color-primary-accent)]" />
            <p className="text-xs font-semibold text-[var(--color-text)]">{t(labelKey)}</p>
          </Card>
        ))}
      </div>

      {verification?.status === 'pending' && (
        <Card className="mt-5 flex flex-col items-center gap-2 p-6 text-center">
          <Clock size={28} className="text-[var(--color-warning)]" />
          <p className="font-display text-lg text-[var(--color-text)]">{t('verification.pendingTitle')}</p>
          <p className="text-sm text-[var(--color-text-muted)]">{t('verification.pendingBody')}</p>
        </Card>
      )}

      {verification?.status === 'rejected' && (
        <Card className="mt-5 flex items-start gap-3 border border-[var(--color-danger)]/30 p-4">
          <XCircle size={20} className="mt-0.5 shrink-0 text-[var(--color-danger)]" />
          <div>
            <p className="text-sm font-semibold text-[var(--color-text)]">{t('verification.rejectedTitle')}</p>
            {verification.rejectionReason && (
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                {t('verification.rejectedBody', { reason: verification.rejectionReason })}
              </p>
            )}
          </div>
        </Card>
      )}

      {(!verification || verification.status === 'rejected') && (
        <>
          <Card className="mt-5 p-5">
            <p className="mb-3 text-sm font-semibold text-[var(--color-text)]">{t('verifySelfie.whyTitle')}</p>
            <ul className="flex flex-col gap-2.5">
              {['whyPoint1', 'whyPoint2', 'whyPoint3'].map((key) => (
                <li key={key} className="flex items-start gap-2.5 text-sm text-[var(--color-text-muted)]">
                  <Check size={16} className="mt-0.5 shrink-0 text-[var(--color-success)]" />
                  {t(`verifySelfie.${key}`)}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="mt-4 p-5">
            <p className="mb-3 text-sm font-semibold text-[var(--color-text)]">{t('verifySelfie.howTitle')}</p>
            <ol className="flex flex-col gap-2.5">
              {['howStep1', 'howStep2', 'howStep3', 'howStep4'].map((key, i) => (
                <li key={key} className="flex items-start gap-2.5 text-sm text-[var(--color-text-muted)]">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-tint)] text-[10px] font-bold text-[var(--color-primary-accent)]">
                    {i + 1}
                  </span>
                  {t(`verifySelfie.${key}`)}
                </li>
              ))}
            </ol>
          </Card>

          <div className="mt-4 rounded-xl bg-[var(--color-success-tint)] p-4 text-xs text-[var(--color-success)]">
            {t('verifySelfie.privacyNote')}
          </div>

          <div className="mt-5 flex flex-col gap-3">
            <Input
              label={t('verification.nidNumber')}
              required
              placeholder={t('verification.nidPlaceholder')}
              value={nidNumber}
              onChange={(e) => setNidNumber(e.target.value.replace(/\D/g, ''))}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-32 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--color-border)] text-[var(--color-text-faint)] hover:border-[var(--color-primary)]"
            >
              <Camera size={24} />
              <span className="text-xs">{selfie ? selfie.name : t('verification.selfie')}</span>
            </button>
            <p className="-mt-1.5 text-center text-xs text-[var(--color-text-faint)]">
              {t('common.imageSizeHint', { size: MAX_IMAGE_SIZE_MB })}
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="user"
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
            />

            <Button size="lg" className="w-full" onClick={handleSubmit} loading={submit.isPending} disabled={!isValid}>
              <Video size={16} /> {t('verifySelfie.startCta')}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
