'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Camera, Check, Trash2, UserRound } from 'lucide-react';
import { AuthShell } from '@/components/auth/AuthShell';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { LocationPicker } from '@/components/ui/LocationPicker';
import { DobPicker } from '@/components/ui/DobPicker';
import { Button } from '@/components/ui/Button';
import { api, ApiError } from '@/lib/api-client';
import { setToken } from '@/lib/auth-token';
import { EMPTY_LOCATION, type ProfileLocation } from '@/lib/geo';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import type { AuthResponse, Gender, ProfileCreatedBy } from '@/lib/types';

const PROFILE_CREATED_BY_OPTIONS: ProfileCreatedBy[] = ['self', 'parents', 'brother', 'sister', 'relative'];

type Step = 'phone' | 'otp' | 'account' | 'profile' | 'location' | 'photos' | 'done';

const REGISTER_PROGRESS_KEY = 'biyekoralagbe_register_progress';

interface StoredRegisterProgress {
  step: Step;
  phone: string;
  verificationToken: string;
  gender: Gender;
  dob: string;
  profileCreatedBy: ProfileCreatedBy;
  name: string;
  location: ProfileLocation;
}

export default function RegisterPage() {
  const { t, locale } = useLanguage();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('+8801');
  const [verificationToken, setVerificationToken] = useState('');
  const [otp, setOtp] = useState('');

  const [password, setPassword] = useState('');
  const [gender, setGender] = useState<Gender>('male');
  const [dob, setDob] = useState('');
  const [profileCreatedBy, setProfileCreatedBy] = useState<ProfileCreatedBy>('self');

  const [name, setName] = useState('');
  const [location, setLocation] = useState<ProfileLocation>(EMPTY_LOCATION);

  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [uploadedCount, setUploadedCount] = useState(0);

  useEffect(() => {
    const urls = photos.map((file) => URL.createObjectURL(file));
    setPhotoPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [photos]);

  // Resume the wizard where it left off after a reload — the account gets created
  // (and the session cookie set) partway through, so losing step state on refresh
  // used to strand people mid-registration. Files can't be persisted, so the
  // photos step always resumes with an empty selection.
  useEffect(() => {
    const raw = sessionStorage.getItem(REGISTER_PROGRESS_KEY);
    if (!raw) return;
    try {
      const saved = JSON.parse(raw) as StoredRegisterProgress;
      if (!saved.step || saved.step === 'done') return;
      setStep(saved.step);
      setPhone(saved.phone ?? '+8801');
      setVerificationToken(saved.verificationToken ?? '');
      setGender(saved.gender ?? 'male');
      setDob(saved.dob ?? '');
      setProfileCreatedBy(saved.profileCreatedBy ?? 'self');
      setName(saved.name ?? '');
      setLocation(saved.location ?? EMPTY_LOCATION);
    } catch {
      sessionStorage.removeItem(REGISTER_PROGRESS_KEY);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (step === 'done') {
      sessionStorage.removeItem(REGISTER_PROGRESS_KEY);
      return;
    }
    const progress: StoredRegisterProgress = {
      step,
      phone,
      verificationToken,
      gender,
      dob,
      profileCreatedBy,
      name,
      location,
    };
    sessionStorage.setItem(REGISTER_PROGRESS_KEY, JSON.stringify(progress));
  }, [step, phone, verificationToken, gender, dob, profileCreatedBy, name, location]);

  const sendOtp = useMutation({
    mutationFn: () => api.post('auth/otp/send', { phone, purpose: 'register' }),
    onSuccess: () => setStep('otp'),
    onError: (e) => toast.error(e instanceof ApiError ? String(e.message) : 'Failed to send code'),
  });

  const verifyOtp = useMutation({
    mutationFn: () => api.post<{ verificationToken: string }>('auth/otp/verify', { phone, code: otp, purpose: 'register' }),
    onSuccess: (data) => {
      setVerificationToken(data.verificationToken);
      setStep('account');
    },
    onError: (e) => toast.error(e instanceof ApiError ? String(e.message) : 'Invalid code'),
  });

  const createAccount = useMutation({
    mutationFn: () => api.post<AuthResponse>('auth/register', { phone, password, gender, dob, verificationToken }),
    onSuccess: async (data) => {
      setToken(data.accessToken);
      await queryClient.invalidateQueries({ queryKey: ['me'] });
      setStep('profile');
    },
    onError: (e) => toast.error(e instanceof ApiError ? String(e.message) : 'Could not create account'),
  });

  const saveProfile = useMutation({
    mutationFn: () =>
      api.put('profiles/me', {
        name,
        country: location.country,
        countryCode: location.countryCode || undefined,
        state: location.state || undefined,
        city: location.city || undefined,
        zip: location.zip || undefined,
        maritalStatus: 'single',
        profileCreatedBy,
      }),
    onSuccess: () => setStep('location'),
    onError: (e) => toast.error(e instanceof ApiError ? String(e.message) : 'Could not save profile'),
  });

  const saveLocation = useMutation({
    mutationFn: (coords: { latitude: number; longitude: number }) => api.patch('users/me/location', coords),
    onSuccess: () => setStep('photos'),
    onError: (e) => toast.error(e instanceof ApiError ? e.message : 'Could not save location'),
  });

  const uploadPhoto = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return api.post('profiles/me/photos', formData);
    },
  });

  function requestLocation() {
    if (!navigator.geolocation) {
      setStep('photos');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => saveLocation.mutate({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => {
        toast(t('auth.register.locationDenied'));
        setStep('photos');
      },
    );
  }

  async function submitPhotos() {
    setUploadedCount(0);
    for (const file of photos) {
      // eslint-disable-next-line no-await-in-loop
      await uploadPhoto.mutateAsync(file);
      setUploadedCount((c) => c + 1);
    }
    setStep('done');
  }

  return (
    <AuthShell>
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.25 }}
        >
          {step === 'phone' && (
            <div className="flex flex-col gap-4">
              <h1 className="font-display text-2xl text-[var(--color-text)]">{t('auth.register.stepPhone')}</h1>
              <p className="text-sm text-[var(--color-text-muted)]">{t('auth.register.stepPhoneBody')}</p>
              <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+8801XXXXXXXXX" />
              <Button onClick={() => sendOtp.mutate()} loading={sendOtp.isPending}>
                {t('auth.register.sendOtp')}
              </Button>
            </div>
          )}

          {step === 'otp' && (
            <div className="flex flex-col gap-4">
              <h1 className="font-display text-2xl text-[var(--color-text)]">{t('auth.register.stepOtpTitle')}</h1>
              <p className="text-sm text-[var(--color-text-muted)]">{t('auth.register.stepOtpBody', { phone })}</p>
              <Input
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="text-center text-2xl tracking-[0.5em]"
              />
              <Button onClick={() => verifyOtp.mutate()} loading={verifyOtp.isPending}>
                {t('auth.register.verifyOtp')}
              </Button>
              <button
                type="button"
                onClick={() => sendOtp.mutate()}
                className="text-xs text-[var(--color-text-muted)] underline"
              >
                {t('auth.register.resendOtp')}
              </button>
            </div>
          )}

          {step === 'account' && (
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <div className="gradient-primary flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[var(--color-on-primary)] glow-primary">
                  <UserRound size={20} />
                </div>
                <div>
                  <h1 className="font-display text-2xl text-[var(--color-text)]">{t('auth.register.stepDetailsTitle')}</h1>
                  <p className="text-sm text-[var(--color-text-muted)]">{t('auth.register.stepDetailsBody')}</p>
                </div>
              </div>

              <Input
                label={t('auth.register.password')}
                type="password"
                required
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <div>
                <label className="text-sm font-medium text-[var(--color-text-muted)]">
                  {t('auth.register.gender')}
                  <span className="text-[var(--color-danger)]"> *</span>
                </label>
                <div className="mt-1.5 grid grid-cols-2 gap-2">
                  {(['male', 'female'] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={`h-11 rounded-xl border text-sm font-medium transition-colors ${
                        gender === g
                          ? 'gradient-primary text-[var(--color-on-primary)] border-transparent'
                          : 'border-[var(--color-border)] text-[var(--color-text-muted)]'
                      }`}
                    >
                      {t(`auth.register.${g}`)}
                    </button>
                  ))}
                </div>
              </div>

              <Select
                label={t('auth.register.profileCreatedBy')}
                value={profileCreatedBy}
                onChange={(e) => setProfileCreatedBy(e.target.value as ProfileCreatedBy)}
              >
                {PROFILE_CREATED_BY_OPTIONS.map((v) => (
                  <option key={v} value={v}>
                    {t(`auth.register.profileCreatedBy${v.charAt(0).toUpperCase()}${v.slice(1)}`)}
                  </option>
                ))}
              </Select>

              <div>
                <DobPicker
                  label={t('auth.register.dob')}
                  required
                  value={dob}
                  onChange={setDob}
                  locale={locale}
                  dayPlaceholder={t('auth.register.dobDay')}
                  monthPlaceholder={t('auth.register.dobMonth')}
                  yearPlaceholder={t('auth.register.dobYear')}
                />
                <p className="mt-1.5 text-xs text-[var(--color-text-faint)]">{t('auth.register.dobHint')}</p>
              </div>

              <Button onClick={() => createAccount.mutate()} loading={createAccount.isPending}>
                {t('common.continue')}
              </Button>
            </div>
          )}

          {step === 'profile' && (
            <div className="flex flex-col gap-4">
              <h1 className="font-display text-2xl text-[var(--color-text)]">{t('auth.register.stepDetailsTitle')}</h1>
              <Input label={t('auth.register.name')} required placeholder="e.g. Ziaul Haque" value={name} onChange={(e) => setName(e.target.value)} />
              <LocationPicker required value={location} onChange={setLocation} />
              <Button onClick={() => saveProfile.mutate()} loading={saveProfile.isPending}>
                {t('common.continue')}
              </Button>
            </div>
          )}

          {step === 'location' && (
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="gradient-primary flex h-14 w-14 items-center justify-center rounded-2xl text-[var(--color-on-primary)] glow-primary">
                <MapPin size={26} />
              </div>
              <h1 className="font-display text-2xl text-[var(--color-text)]">{t('auth.register.stepLocationTitle')}</h1>
              <p className="text-sm text-[var(--color-text-muted)]">{t('auth.register.stepLocationBody')}</p>
              <Button className="w-full" onClick={requestLocation} loading={saveLocation.isPending}>
                {t('auth.register.enableLocation')}
              </Button>
              <button
                type="button"
                onClick={() => setStep('photos')}
                className="text-xs text-[var(--color-text-muted)] underline"
              >
                {t('auth.register.skipForNow')}
              </button>
            </div>
          )}

          {step === 'photos' && (
            <div className="flex flex-col gap-4">
              <div className="gradient-primary mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-[var(--color-on-primary)] glow-primary">
                <Camera size={26} />
              </div>
              <h1 className="font-display text-center text-2xl text-[var(--color-text)]">
                {t('auth.register.stepPhotosTitle')}
              </h1>
              <p className="text-center text-sm text-[var(--color-text-muted)]">{t('auth.register.stepPhotosBody')}</p>

              <label className="flex h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--color-border)] text-sm text-[var(--color-text-muted)] hover:border-[var(--color-primary)]">
                <Camera size={20} />
                {t('auth.register.addPhoto')}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => setPhotos(Array.from(e.target.files ?? []))}
                />
              </label>

              {photos.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {photoPreviews.map((url, i) => (
                    <div key={url} className="group relative h-20 w-20 overflow-hidden rounded-lg">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                        className="absolute inset-0 flex items-center justify-center bg-[var(--color-scrim)] opacity-0 transition-opacity group-hover:opacity-100"
                        aria-label="Remove photo"
                      >
                        <Trash2 size={16} className="text-[var(--color-on-primary)]" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {photos.length > 0 && (
                <p className="text-xs text-[var(--color-text-muted)]">
                  {photos.length} photo(s) selected
                  {uploadPhoto.isPending && ` — uploading ${uploadedCount + 1}/${photos.length}...`}
                </p>
              )}

              <Button onClick={submitPhotos} loading={uploadPhoto.isPending} disabled={photos.length === 0}>
                {t('auth.register.finish')}
              </Button>
            </div>
          )}

          {step === 'done' && (
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-success)]/15 text-[var(--color-success)]">
                <Check size={28} />
              </div>
              <h1 className="font-display text-2xl text-[var(--color-text)]">{t('auth.register.pendingTitle')}</h1>
              <p className="text-sm text-[var(--color-text-muted)]">{t('auth.register.pendingBody')}</p>
              <Button className="w-full" onClick={() => router.push('/dashboard')}>
                {t('auth.register.goToApp')}
              </Button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </AuthShell>
  );
}
