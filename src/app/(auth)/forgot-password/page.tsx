'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import { AuthShell } from '@/components/auth/AuthShell';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { EMPTY_PHONE, PhoneInput, formatPhone, type PhoneValue } from '@/components/ui/PhoneInput';
import { api, ApiError } from '@/lib/api-client';
import { setToken } from '@/lib/auth-token';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import type { AuthResponse } from '@/lib/types';

const MIN_PASSWORD_LENGTH = 8;
const CODE_LENGTH = 6;
/** Matches the shortest sensible gap between gateway sends; the button says how long is left. */
const RESEND_SECONDS = 60;

type Stage = 'phone' | 'code' | 'password';

interface SendOtpResponse {
  success: boolean;
  /** 'sms' or 'email' — the API falls back to email while SMS sending is off. */
  channel: string;
  expiresInSeconds: number;
}

/**
 * Password recovery, in the three steps the API models it as: request a code
 * against a phone number, exchange the code for a short-lived verification
 * token, then set the new password with that token.
 *
 * The reset is keyed on the phone number, not the email — `POST auth/otp/send`
 * and `POST auth/reset-password` both take `phone`, and the code itself may
 * arrive by email when SMS sending is switched off. That is why this asks for
 * the number even from members who normally sign in with their address.
 */
export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [stage, setStage] = useState<Stage>('phone');
  const [phone, setPhone] = useState<PhoneValue>(EMPTY_PHONE);
  const [code, setCode] = useState('');
  const [verificationToken, setVerificationToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [resendIn, setResendIn] = useState(0);

  const formattedPhone = formatPhone(phone);

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setInterval(() => setResendIn((n) => (n <= 1 ? 0 : n - 1)), 1000);
    return () => clearInterval(timer);
  }, [resendIn]);

  function reportError(error: unknown, fallback: string) {
    toast.error(error instanceof ApiError ? String(error.message) : fallback);
  }

  const sendOtp = useMutation({
    mutationFn: () =>
      api.post<SendOtpResponse>('auth/otp/send', { phone: formattedPhone, purpose: 'reset' }),
    onSuccess: (data) => {
      setStage('code');
      setResendIn(RESEND_SECONDS);
      // Which channel it took is worth saying out loud: with SMS off the code
      // goes to the account's email, and someone staring at their phone would
      // otherwise conclude it never arrived.
      toast.success(
        data.channel === 'email' ? t('auth.forgot.sentEmail') : t('auth.forgot.sentSms'),
      );
    },
    onError: (error) => reportError(error, t('auth.forgot.errPhone')),
  });

  const verifyOtp = useMutation({
    mutationFn: () =>
      api.post<{ verificationToken: string }>('auth/otp/verify', {
        phone: formattedPhone,
        code: code.trim(),
        purpose: 'reset',
      }),
    onSuccess: (data) => {
      setVerificationToken(data.verificationToken);
      setStage('password');
    },
    onError: (error) => reportError(error, t('auth.forgot.errCode')),
  });

  const resetPassword = useMutation({
    mutationFn: () =>
      api.post<AuthResponse>('auth/reset-password', {
        phone: formattedPhone,
        newPassword: password,
        verificationToken,
      }),
    // The API answers with a live session, so there is no reason to send someone
    // who has just proved ownership of the number back to the sign-in form.
    onSuccess: async (data) => {
      setToken(data.accessToken);
      await queryClient.invalidateQueries({ queryKey: ['me'] });
      toast.success(t('auth.forgot.success'));
      router.push('/dashboard');
    },
    onError: (error) => reportError(error, t('auth.forgot.submitError')),
  });

  function submitPhone() {
    if (phone.number.replace(/\D/g, '').length < 6) {
      setErrors({ phone: t('auth.forgot.errPhone') });
      return;
    }
    setErrors({});
    sendOtp.mutate();
  }

  function submitCode() {
    if (code.trim().length !== CODE_LENGTH) {
      setErrors({ code: t('auth.forgot.errCode') });
      return;
    }
    setErrors({});
    verifyOtp.mutate();
  }

  function submitPassword() {
    const found: Record<string, string> = {};
    if (password.length < MIN_PASSWORD_LENGTH) {
      found.password = t('auth.forgot.errPasswordMin', { min: MIN_PASSWORD_LENGTH });
    }
    if (password !== confirmPassword) {
      found.confirmPassword = t('auth.forgot.errPasswordMatch');
    }
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    resetPassword.mutate();
  }

  const subtitle =
    stage === 'phone'
      ? t('auth.forgot.subtitleStart')
      : stage === 'code'
        ? t('auth.forgot.subtitleCode', { phone: formattedPhone })
        : t('auth.forgot.subtitleReset');

  return (
    <AuthShell>
      <h1 className="font-display text-2xl text-[var(--color-text)]">{t('auth.forgot.title')}</h1>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">{subtitle}</p>

      <form
        className="mt-6 flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (stage === 'phone') submitPhone();
          else if (stage === 'code') submitCode();
          else submitPassword();
        }}
      >
        {stage === 'phone' && (
          <>
            <PhoneInput
              label={t('auth.register.phoneLabel')}
              required
              value={phone}
              onChange={(next) => {
                setPhone(next);
                setErrors({});
              }}
              error={errors.phone}
            />
            <Button type="submit" className="mt-2 w-full" loading={sendOtp.isPending}>
              {t('auth.forgot.sendCode')}
            </Button>
          </>
        )}

        {stage === 'code' && (
          <>
            <Input
              label={t('auth.forgot.code')}
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={CODE_LENGTH}
              placeholder={t('auth.forgot.codePlaceholder')}
              value={code}
              error={errors.code}
              // Stripped rather than blocked, so a code pasted as "123 456"
              // out of a message still goes in.
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            />
            <Button type="submit" className="mt-2 w-full" loading={verifyOtp.isPending}>
              {t('auth.forgot.verify')}
            </Button>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                disabled={resendIn > 0 || sendOtp.isPending}
                onClick={() => sendOtp.mutate()}
                className="text-sm font-medium text-[var(--color-primary-light)] disabled:text-[var(--color-text-faint)]"
              >
                {resendIn > 0
                  ? t('auth.forgot.resendIn', { seconds: resendIn })
                  : t('auth.forgot.resend')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStage('phone');
                  setCode('');
                  setErrors({});
                }}
                className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              >
                {t('auth.forgot.changeNumber')}
              </button>
            </div>
          </>
        )}

        {stage === 'password' && (
          <>
            <Input
              label={t('auth.forgot.newPassword')}
              type="password"
              required
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              error={errors.password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Input
              label={t('auth.forgot.confirmPassword')}
              type="password"
              required
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirmPassword}
              error={errors.confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <Button type="submit" className="mt-2 w-full" loading={resetPassword.isPending}>
              {t('auth.forgot.submit')}
            </Button>
          </>
        )}
      </form>

      <p className="mt-6 text-center text-sm">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
        >
          <ArrowLeft size={14} />
          {t('auth.forgot.backToLogin')}
        </Link>
      </p>
    </AuthShell>
  );
}
