'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  Check,
  GraduationCap,
  Heart,
  Info,
  MapPin,
  PersonStanding,
  Trash2,
  UserRound,
} from 'lucide-react';
import { AuthShell } from '@/components/auth/AuthShell';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { RichText } from '@/components/ui/RichText';
import { LocationPicker } from '@/components/ui/LocationPicker';
import { DobPicker } from '@/components/ui/DobPicker';
import { api, ApiError } from '@/lib/api-client';
import { setToken } from '@/lib/auth-token';
import { EMPTY_LOCATION, type ProfileLocation } from '@/lib/geo';
import { cmToFeetInches, feetInchesToCm } from '@/lib/height';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import {
  BODY_TYPES,
  COMPLEXIONS,
  BLOOD_GROUPS,
  DIETS,
  FAMILY_VALUES,
  MARITAL_STATUSES,
  MONTHLY_INCOME_BANDS,
  PARENT_STATUSES,
  PROFESSIONAL_AREAS,
  PROFILE_CREATED_BY,
  QUALIFICATIONS,
  RELIGIONS,
  RELIGIOUS_VALUES,
  SMOKE_OPTIONS,
  WORKING_SECTORS,
  enumKey,
} from '@/lib/profileOptions';
import type { AuthResponse, Gender, ProfileCreatedBy } from '@/lib/types';

/**
 * Registration follows the bdmarriage flow: verify a phone, create the account,
 * then walk through the bio-data one themed screen at a time.
 *
 * Each wizard step saves its own slice via `PUT profiles/me`, which is a
 * partial upsert — so someone who drops out at "Life Style" still leaves a
 * profile with everything up to that point, rather than nothing at all.
 */

type Step =
  | 'phone'
  | 'otp'
  | 'account'
  | 'basic'
  | 'education'
  | 'family'
  | 'physical'
  | 'lifestyle'
  | 'about'
  | 'location'
  | 'photos'
  | 'done';

const REGISTER_PROGRESS_KEY = 'biyekoralagbe_register_progress';

const HEIGHT_OPTIONS = Array.from({ length: feetInchesToCm(7, 0) - feetInchesToCm(4, 0) + 1 }, (_, i) =>
  feetInchesToCm(4, 0) + i,
);
const WEIGHT_OPTIONS = Array.from({ length: 121 }, (_, i) => 30 + i);

interface WizardForm {
  // Account
  email: string;
  password: string;
  // Basic info
  gender: Gender | '';
  name: string;
  profileCreatedBy: ProfileCreatedBy;
  relativeName: string;
  dob: string;
  maritalStatus: string;
  religion: string;
  nationality: string;
  // Education & career
  education: string;
  educationDetails: string;
  workingSector: string;
  profession: string;
  professionDetails: string;
  monthlyIncome: string;
  incomeIsPrivate: boolean;
  // Family & location
  fatherStatus: string;
  fatherOccupation: string;
  motherStatus: string;
  motherOccupation: string;
  brothersUnmarried: string;
  brothersMarried: string;
  sistersUnmarried: string;
  sistersMarried: string;
  familyDetails: string;
  location: ProfileLocation;
  // Physical
  heightCm: string;
  weightKg: string;
  bodyType: string;
  complexion: string;
  bloodGroup: string;
  physicalDetails: string;
  // Life style
  religiousValue: string;
  familyValues: string;
  diet: string;
  smoke: string;
  // About
  bio: string;
}

const emptyForm = (): WizardForm => ({
  email: '',
  password: '',
  gender: '',
  name: '',
  profileCreatedBy: 'self',
  relativeName: '',
  dob: '',
  maritalStatus: '',
  religion: '',
  nationality: 'Bangladeshi',
  education: '',
  educationDetails: '',
  workingSector: '',
  profession: '',
  professionDetails: '',
  monthlyIncome: '',
  incomeIsPrivate: false,
  fatherStatus: '',
  fatherOccupation: '',
  motherStatus: '',
  motherOccupation: '',
  brothersUnmarried: '0',
  brothersMarried: '0',
  sistersUnmarried: '0',
  sistersMarried: '0',
  familyDetails: '',
  location: EMPTY_LOCATION,
  heightCm: '',
  weightKg: '',
  bodyType: '',
  complexion: '',
  bloodGroup: '',
  physicalDetails: '',
  religiousValue: '',
  familyValues: 'traditional',
  diet: 'not_matter',
  smoke: '',
  bio: '',
});

interface StoredProgress {
  step: Step;
  phone: string;
  verificationToken: string;
  form: WizardForm;
}

export default function RegisterPage() {
  const { t, locale } = useLanguage();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('+8801');
  const [verificationToken, setVerificationToken] = useState('');
  const [otp, setOtp] = useState('');
  const [form, setForm] = useState<WizardForm>(emptyForm);

  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [uploadedCount, setUploadedCount] = useState(0);

  function set<K extends keyof WizardForm>(key: K, value: WizardForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

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
      const saved = JSON.parse(raw) as StoredProgress;
      if (!saved.step || saved.step === 'done') return;
      setStep(saved.step);
      setPhone(saved.phone ?? '+8801');
      setVerificationToken(saved.verificationToken ?? '');
      // Spread over a fresh form so a stored payload written by an earlier
      // version of this wizard can't leave a new field undefined.
      setForm({ ...emptyForm(), ...(saved.form ?? {}) });
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
    const progress: StoredProgress = { step, phone, verificationToken, form };
    sessionStorage.setItem(REGISTER_PROGRESS_KEY, JSON.stringify(progress));
  }, [step, phone, verificationToken, form]);

  const sendOtp = useMutation({
    mutationFn: () => api.post('auth/otp/send', { phone, purpose: 'register' }),
    onSuccess: () => setStep('otp'),
    onError: (e) => toast.error(e instanceof ApiError ? String(e.message) : 'Failed to send code'),
  });

  const verifyOtp = useMutation({
    mutationFn: () =>
      api.post<{ verificationToken: string }>('auth/otp/verify', { phone, code: otp, purpose: 'register' }),
    onSuccess: (data) => {
      setVerificationToken(data.verificationToken);
      setStep('account');
    },
    onError: (e) => toast.error(e instanceof ApiError ? String(e.message) : 'Invalid code'),
  });

  const createAccount = useMutation({
    mutationFn: () =>
      api.post<AuthResponse>('auth/register', {
        phone,
        email: form.email || undefined,
        password: form.password,
        verificationToken,
      }),
    onSuccess: async (data) => {
      setToken(data.accessToken);
      await queryClient.invalidateQueries({ queryKey: ['me'] });
      setStep('basic');
    },
    onError: (e) => toast.error(e instanceof ApiError ? String(e.message) : 'Could not create account'),
  });

  /**
   * Saves one step's slice and advances. Gender and date of birth live on the
   * user record rather than the profile, so the Basic Info step also PATCHes
   * `users/me/basics` — that is the only step that touches two endpoints.
   */
  const saveStep = useMutation({
    mutationFn: async ({ payload, basics }: { payload: Record<string, unknown>; basics?: boolean }) => {
      if (basics) {
        await api.patch('users/me/basics', {
          gender: form.gender || undefined,
          dob: form.dob || undefined,
        });
      }
      await api.put('profiles/me', payload);
    },
    onError: (e) => toast.error(e instanceof ApiError ? String(e.message) : t('auth.register.saveError')),
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

  /** Numeric profile fields arrive as strings from `<select>`/`<input>`. */
  const num = (value: string): number | undefined => (value === '' ? undefined : Number(value));
  const str = (value: string): string | undefined => value.trim() || undefined;

  function advance(next: Step, payload: Record<string, unknown>, basics?: boolean) {
    saveStep.mutate({ payload, basics }, { onSuccess: () => setStep(next) });
  }

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

  const isWizardStep = WIZARD_STEPS.includes(step as WizardStep);

  return (
    <AuthShell wide={isWizardStep}>
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
              <p className="text-center text-xs text-[var(--color-text-muted)]">
                {t('auth.register.alreadyMember')}{' '}
                <Link href="/login" className="text-[var(--color-primary-accent)] hover:underline">
                  {t('auth.register.loginNow')}
                </Link>
              </p>
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
                  <h1 className="font-display text-2xl text-[var(--color-text)]">
                    {t('auth.register.stepAccountTitle')}
                  </h1>
                  <p className="text-sm text-[var(--color-text-muted)]">{t('auth.register.stepAccountBody')}</p>
                </div>
              </div>

              <Input label={t('auth.register.mobileNumber')} value={phone} readOnly disabled />
              <Input
                label={t('auth.register.email')}
                type="email"
                required
                placeholder={t('auth.register.emailPlaceholder')}
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
              />
              <Input
                label={t('auth.register.createPassword')}
                type="password"
                required
                placeholder="At least 8 characters"
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
              />
              <Select
                label={t('auth.register.profileCreatedBy')}
                value={form.profileCreatedBy}
                onChange={(e) => set('profileCreatedBy', e.target.value as ProfileCreatedBy)}
              >
                {PROFILE_CREATED_BY.map((v) => (
                  <option key={v} value={v}>
                    {t(`auth.register.profileCreatedBy${enumKey(v)}`)}
                  </option>
                ))}
              </Select>

              <Button
                onClick={() => createAccount.mutate()}
                loading={createAccount.isPending}
                disabled={!form.email.trim() || form.password.length < 8}
              >
                {t('common.continue')}
              </Button>

              <p className="text-center text-xs text-[var(--color-text-faint)]">
                <RichText tKey="auth.register.termsNotice" values={{ terms: <LegalLink href="/terms" labelKey="contactPage.formConsentTerms" />, privacy: <LegalLink href="/privacy" labelKey="contactPage.formConsentPrivacy" /> }} />
              </p>
            </div>
          )}

          {step === 'basic' && (
            <WizardStepShell
              icon={Info}
              title={t('auth.register.stepBasicTitle')}
              subtitle={t('auth.register.stepBasicSubtitle')}
              section={t('auth.register.stepBasicSection')}
              percent={20}
            >
              <div className="flex flex-col gap-4">
                <FieldRow label={t('auth.register.gender')} required>
                  <div className="grid grid-cols-2 gap-2">
                    {(['male', 'female'] as const).map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => set('gender', g)}
                        className={`h-11 rounded-xl border text-sm font-medium transition-colors ${
                          form.gender === g
                            ? 'gradient-primary border-transparent text-[var(--color-on-primary)]'
                            : 'border-[var(--color-border)] text-[var(--color-text-muted)]'
                        }`}
                      >
                        {t(`auth.register.${g}`)}
                      </button>
                    ))}
                  </div>
                </FieldRow>

                <Input
                  label={t('auth.register.candidateName')}
                  required
                  placeholder="e.g. Ziaul Haque"
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                />

                <Select
                  label={t('auth.register.profileCreatedBy')}
                  required
                  value={form.profileCreatedBy}
                  onChange={(e) => set('profileCreatedBy', e.target.value as ProfileCreatedBy)}
                >
                  {PROFILE_CREATED_BY.map((v) => (
                    <option key={v} value={v}>
                      {t(`auth.register.profileCreatedBy${enumKey(v)}`)}
                    </option>
                  ))}
                </Select>

                {/* Only meaningful when someone else runs the profile. */}
                {form.profileCreatedBy !== 'self' && (
                  <Input
                    label={t('auth.register.relativeName')}
                    required
                    value={form.relativeName}
                    onChange={(e) => set('relativeName', e.target.value)}
                  />
                )}

                <div>
                  <DobPicker
                    label={t('auth.register.dob')}
                    required
                    value={form.dob}
                    onChange={(v) => set('dob', v)}
                    locale={locale}
                    dayPlaceholder={t('auth.register.dobDay')}
                    monthPlaceholder={t('auth.register.dobMonth')}
                    yearPlaceholder={t('auth.register.dobYear')}
                  />
                  <p className="mt-1.5 text-xs text-[var(--color-text-faint)]">{t('auth.register.dobHint')}</p>
                </div>

                <Select
                  label={t('profileDetail.maritalStatus')}
                  required
                  placeholder="--- Please select ---"
                  value={form.maritalStatus}
                  onChange={(e) => set('maritalStatus', e.target.value)}
                >
                  {MARITAL_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {t(`profileDetail.${s}`)}
                    </option>
                  ))}
                </Select>

                <Select
                  label={t('profileDetail.religion')}
                  required
                  placeholder="--- Please select ---"
                  value={form.religion}
                  onChange={(e) => set('religion', e.target.value)}
                >
                  {RELIGIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </Select>

                <Input
                  label={t('auth.register.nationality')}
                  value={form.nationality}
                  onChange={(e) => set('nationality', e.target.value)}
                />
              </div>

              <StepActions
                loading={saveStep.isPending}
                disabled={
                  !form.gender ||
                  !form.name.trim() ||
                  !form.dob ||
                  !form.maritalStatus ||
                  !form.religion ||
                  (form.profileCreatedBy !== 'self' && !form.relativeName.trim())
                }
                onContinue={() =>
                  advance(
                    'education',
                    {
                      name: form.name.trim(),
                      profileCreatedBy: form.profileCreatedBy,
                      relativeName: form.profileCreatedBy === 'self' ? undefined : str(form.relativeName),
                      maritalStatus: form.maritalStatus,
                      religion: str(form.religion),
                      nationality: str(form.nationality),
                    },
                    true,
                  )
                }
              />
            </WizardStepShell>
          )}

          {step === 'education' && (
            <WizardStepShell
              icon={GraduationCap}
              title={t('auth.register.stepEducationTitle')}
              subtitle={t('auth.register.stepEducationSubtitle')}
              section={t('auth.register.stepEducationSection')}
              percent={40}
            >
              <div className="flex flex-col gap-4">
                <Select
                  label={t('auth.register.highestQualification')}
                  required
                  placeholder={t('auth.register.selectQualification')}
                  value={form.education}
                  onChange={(e) => set('education', e.target.value)}
                >
                  {QUALIFICATIONS.map((q) => (
                    <option key={q} value={q}>
                      {q}
                    </option>
                  ))}
                </Select>

                <TextareaField
                  label={t('auth.register.educationDetails')}
                  placeholder={t('auth.register.educationDetailsPlaceholder')}
                  hint={t('auth.register.educationDetailsHint')}
                  value={form.educationDetails}
                  onChange={(v) => set('educationDetails', v)}
                />

                <Select
                  label={t('auth.register.workingSector')}
                  required
                  placeholder={t('auth.register.selectSector')}
                  value={form.workingSector}
                  onChange={(e) => set('workingSector', e.target.value)}
                >
                  {WORKING_SECTORS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>

                <Select
                  label={t('auth.register.profession')}
                  required
                  placeholder={t('auth.register.selectProfession')}
                  value={form.profession}
                  onChange={(e) => set('profession', e.target.value)}
                >
                  {PROFESSIONAL_AREAS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </Select>

                <TextareaField
                  label={t('auth.register.professionDetails')}
                  placeholder={t('auth.register.professionDetailsPlaceholder')}
                  hint={t('auth.register.professionDetailsHint')}
                  value={form.professionDetails}
                  onChange={(v) => set('professionDetails', v)}
                />

                <div>
                  <Select
                    label={t('auth.register.monthlyIncome')}
                    placeholder={t('auth.register.selectIncome')}
                    value={form.monthlyIncome}
                    onChange={(e) => set('monthlyIncome', e.target.value)}
                  >
                    {MONTHLY_INCOME_BANDS.map((band) => (
                      <option key={band.value} value={band.value}>
                        {band.label}
                      </option>
                    ))}
                  </Select>
                  <label className="mt-2 flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                    <input
                      type="checkbox"
                      checked={form.incomeIsPrivate}
                      onChange={(e) => set('incomeIsPrivate', e.target.checked)}
                      className="h-4 w-4 accent-[var(--color-primary)]"
                    />
                    {t('auth.register.keepItPrivate')} 🔒
                  </label>
                </div>
              </div>

              <StepActions
                loading={saveStep.isPending}
                disabled={!form.education || !form.workingSector || !form.profession}
                onBack={() => setStep('basic')}
                onContinue={() =>
                  advance('family', {
                    education: form.education,
                    educationDetails: str(form.educationDetails),
                    workingSector: form.workingSector,
                    profession: form.profession,
                    professionDetails: str(form.professionDetails),
                    monthlyIncome: num(form.monthlyIncome),
                    incomeIsPrivate: form.incomeIsPrivate,
                  })
                }
              />
            </WizardStepShell>
          )}

          {step === 'family' && (
            <WizardStepShell
              icon={MapPin}
              title={t('auth.register.stepFamilyTitle')}
              subtitle={t('auth.register.stepFamilySubtitle')}
              section={t('auth.register.stepFamilySection')}
              percent={60}
            >
              <div className="flex flex-col gap-4">
                <Select
                  label={t('auth.register.fatherStatus')}
                  required
                  placeholder="--- Please select ---"
                  value={form.fatherStatus}
                  onChange={(e) => set('fatherStatus', e.target.value)}
                >
                  {PARENT_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {t(`profileDetail.parentStatus${enumKey(s)}`)}
                    </option>
                  ))}
                </Select>
                <Input
                  label={t('auth.register.fatherOccupation')}
                  value={form.fatherOccupation}
                  onChange={(e) => set('fatherOccupation', e.target.value)}
                />
                <Select
                  label={t('auth.register.motherStatus')}
                  required
                  placeholder="--- Please select ---"
                  value={form.motherStatus}
                  onChange={(e) => set('motherStatus', e.target.value)}
                >
                  {PARENT_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {t(`profileDetail.parentStatus${enumKey(s)}`)}
                    </option>
                  ))}
                </Select>
                <Input
                  label={t('auth.register.motherOccupation')}
                  value={form.motherOccupation}
                  onChange={(e) => set('motherOccupation', e.target.value)}
                />

                <FieldRow label={t('auth.register.yourSiblings')}>
                  <div className="grid grid-cols-2 gap-4">
                    {(
                      [
                        ['brothers', 'brothersUnmarried', 'brothersMarried'],
                        ['sisters', 'sistersUnmarried', 'sistersMarried'],
                      ] as const
                    ).map(([groupKey, unmarriedKey, marriedKey]) => (
                      <div key={groupKey} className="rounded-xl border border-[var(--color-border)] p-3">
                        <p className="text-center text-sm font-medium text-[var(--color-text)]">
                          {t(`auth.register.${groupKey}`)}
                        </p>
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          {(
                            [
                              [unmarriedKey, 'notMarried'],
                              [marriedKey, 'married'],
                            ] as const
                          ).map(([field, labelKey]) => (
                            <Select
                              key={field}
                              label={t(`auth.register.${labelKey}`)}
                              value={form[field]}
                              onChange={(e) => set(field, e.target.value)}
                            >
                              {Array.from({ length: 11 }, (_, i) => (
                                <option key={i} value={i}>
                                  {i}
                                </option>
                              ))}
                            </Select>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </FieldRow>

                <LocationPicker required value={form.location} onChange={(v) => set('location', v)} />

                <TextareaField
                  label={t('auth.register.familyDetails')}
                  placeholder={t('auth.register.familyDetailsPlaceholder')}
                  hint={t('auth.register.familyDetailsHint')}
                  value={form.familyDetails}
                  onChange={(v) => set('familyDetails', v)}
                />
              </div>

              <StepActions
                loading={saveStep.isPending}
                disabled={!form.fatherStatus || !form.motherStatus || !form.location.country}
                onBack={() => setStep('education')}
                onContinue={() =>
                  advance('physical', {
                    fatherStatus: form.fatherStatus,
                    fatherOccupation: str(form.fatherOccupation),
                    motherStatus: form.motherStatus,
                    motherOccupation: str(form.motherOccupation),
                    brothersUnmarried: num(form.brothersUnmarried),
                    brothersMarried: num(form.brothersMarried),
                    sistersUnmarried: num(form.sistersUnmarried),
                    sistersMarried: num(form.sistersMarried),
                    // The older single-count fields stay in step with the
                    // married/unmarried split so profile completion and the
                    // admin panel keep reading a correct total.
                    numberOfBrothers: Number(form.brothersUnmarried) + Number(form.brothersMarried),
                    numberOfSisters: Number(form.sistersUnmarried) + Number(form.sistersMarried),
                    siblingsCount:
                      Number(form.brothersUnmarried) +
                      Number(form.brothersMarried) +
                      Number(form.sistersUnmarried) +
                      Number(form.sistersMarried),
                    familyDetails: str(form.familyDetails),
                    country: form.location.country,
                    countryCode: form.location.countryCode || undefined,
                    state: form.location.state || undefined,
                    city: form.location.city || undefined,
                    zip: form.location.zip || undefined,
                  })
                }
              />
            </WizardStepShell>
          )}

          {step === 'physical' && (
            <WizardStepShell
              icon={PersonStanding}
              title={t('auth.register.stepPhysicalTitle')}
              subtitle={t('auth.register.stepPhysicalSubtitle')}
              section={t('auth.register.stepPhysicalSection')}
              percent={80}
            >
              <div className="flex flex-col gap-4">
                <Select
                  label={t('profileDetail.height')}
                  required
                  placeholder="--- Select your height ---"
                  value={form.heightCm}
                  onChange={(e) => set('heightCm', e.target.value)}
                >
                  {HEIGHT_OPTIONS.map((cm) => {
                    const { feet, inches } = cmToFeetInches(cm);
                    return (
                      <option key={cm} value={cm}>
                        {feet} feet {inches} inch
                      </option>
                    );
                  })}
                </Select>

                <Select
                  label={t('auth.register.weight')}
                  required
                  placeholder={t('auth.register.selectWeight')}
                  value={form.weightKg}
                  onChange={(e) => set('weightKg', e.target.value)}
                >
                  {WEIGHT_OPTIONS.map((kg) => (
                    <option key={kg} value={kg}>
                      {kg} kg
                    </option>
                  ))}
                </Select>

                <RadioRow
                  label={t('auth.register.bodyType')}
                  required
                  options={BODY_TYPES.map((b) => ({ value: b, label: b }))}
                  value={form.bodyType}
                  onChange={(v) => set('bodyType', v)}
                />

                <RadioRow
                  label={t('profileDetail.complexion')}
                  required
                  options={COMPLEXIONS.map((c) => ({ value: c, label: t(`profileDetail.complexion${enumKey(c)}`) }))}
                  value={form.complexion}
                  onChange={(v) => set('complexion', v)}
                />

                <Select
                  label={t('profileDetail.bloodGroup')}
                  placeholder="--- Select blood group ---"
                  value={form.bloodGroup}
                  onChange={(e) => set('bloodGroup', e.target.value)}
                >
                  {BLOOD_GROUPS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </Select>

                <TextareaField
                  label={t('auth.register.physicalDetails')}
                  placeholder={t('auth.register.physicalDetailsPlaceholder')}
                  hint={t('auth.register.physicalDetailsHint')}
                  value={form.physicalDetails}
                  onChange={(v) => set('physicalDetails', v)}
                />
              </div>

              <StepActions
                loading={saveStep.isPending}
                disabled={!form.heightCm || !form.weightKg || !form.bodyType || !form.complexion}
                onBack={() => setStep('family')}
                onContinue={() =>
                  advance('lifestyle', {
                    heightCm: num(form.heightCm),
                    weightKg: num(form.weightKg),
                    bodyType: form.bodyType,
                    complexion: form.complexion,
                    bloodGroup: str(form.bloodGroup),
                    physicalDetails: str(form.physicalDetails),
                  })
                }
              />
            </WizardStepShell>
          )}

          {step === 'lifestyle' && (
            <WizardStepShell
              icon={Heart}
              title={t('auth.register.stepLifestyleTitle')}
              subtitle={t('auth.register.stepLifestyleSubtitle')}
              section={t('auth.register.stepLifestyleSection')}
              percent={90}
            >
              <div className="flex flex-col gap-4">
                <Select
                  label={t('auth.register.religiousValue')}
                  required
                  placeholder={t('auth.register.selectReligiousValue')}
                  value={form.religiousValue}
                  onChange={(e) => set('religiousValue', e.target.value)}
                >
                  {RELIGIOUS_VALUES.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </Select>

                <RadioRow
                  label={t('auth.register.familyValues')}
                  options={FAMILY_VALUES.map((v) => ({
                    value: v,
                    label: t(`profileDetail.familyValues${enumKey(v)}`),
                  }))}
                  value={form.familyValues}
                  onChange={(v) => set('familyValues', v)}
                />

                <RadioRow
                  label={t('auth.register.diet')}
                  options={DIETS.map((v) => ({ value: v, label: t(`profileDetail.diet${enumKey(v)}`) }))}
                  value={form.diet}
                  onChange={(v) => set('diet', v)}
                />

                <RadioRow
                  label={t('auth.register.smoke')}
                  required
                  options={SMOKE_OPTIONS.map((v) => ({ value: v, label: t(`profileDetail.smoke${enumKey(v)}`) }))}
                  value={form.smoke}
                  onChange={(v) => set('smoke', v)}
                />
              </div>

              <StepActions
                loading={saveStep.isPending}
                disabled={!form.religiousValue || !form.smoke}
                onBack={() => setStep('physical')}
                onContinue={() =>
                  advance('about', {
                    religiousValue: form.religiousValue,
                    familyValues: form.familyValues,
                    diet: form.diet,
                    smoke: form.smoke,
                  })
                }
              />
            </WizardStepShell>
          )}

          {step === 'about' && (
            <WizardStepShell
              icon={UserRound}
              title={t('auth.register.stepAboutTitle')}
              subtitle={t('auth.register.stepAboutSubtitle')}
              section={t('auth.register.stepAboutSection')}
              percent={100}
            >
              <div className="flex flex-col gap-3">
                <p className="rounded-xl bg-[var(--color-surface)] p-3 text-xs leading-relaxed text-[var(--color-text-muted)]">
                  {t('auth.register.aboutHint')}
                </p>
                <TextareaField
                  label={t('auth.register.writeAboutYourself')}
                  required
                  rows={8}
                  placeholder={t('auth.register.aboutPlaceholder')}
                  value={form.bio}
                  onChange={(v) => set('bio', v)}
                />
              </div>

              <StepActions
                loading={saveStep.isPending}
                disabled={form.bio.trim().length < 20}
                onBack={() => setStep('lifestyle')}
                continueLabel={t('auth.register.completeRegistration')}
                onContinue={() => advance('location', { bio: form.bio.trim() })}
              />
            </WizardStepShell>
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

const WIZARD_STEPS = ['basic', 'education', 'family', 'physical', 'lifestyle', 'about'] as const;
type WizardStep = (typeof WIZARD_STEPS)[number];

/** The bdmarriage step chrome: heading, section strip with an N% meter, body. */
function WizardStepShell({
  icon: Icon,
  title,
  subtitle,
  section,
  percent,
  children,
}: {
  icon: typeof Info;
  title: string;
  subtitle: string;
  section: string;
  percent: number;
  children: ReactNode;
}) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <h1 className="font-display text-xl text-[var(--color-text)] sm:text-2xl">{title}</h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">{subtitle}</p>
      </div>

      <div>
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text)]">
            <Icon size={18} className="text-[var(--color-primary-accent)]" />
            {section}
          </span>
          <span className="text-sm font-semibold text-[var(--color-text)]">
            {t('auth.register.percentComplete', { percent })}
          </span>
        </div>
        <div className="mt-2">
          <ProgressBar percent={percent} />
        </div>
      </div>

      {children}
    </div>
  );
}

function StepActions({
  onBack,
  onContinue,
  loading,
  disabled,
  continueLabel,
}: {
  onBack?: () => void;
  onContinue: () => void;
  loading: boolean;
  disabled: boolean;
  continueLabel?: string;
}) {
  const { t } = useLanguage();

  return (
    <div className="flex gap-2">
      {onBack && (
        <Button variant="secondary" className="flex-1" onClick={onBack} disabled={loading}>
          {t('common.back')}
        </Button>
      )}
      <Button className="flex-1" onClick={onContinue} loading={loading} disabled={disabled}>
        {continueLabel ?? t('common.continue')}
      </Button>
    </div>
  );
}

function FieldRow({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-[var(--color-text-muted)]">
        {label}
        {required && <span className="text-[var(--color-danger)]"> *</span>}
      </span>
      {children}
    </div>
  );
}

/** The reference collects body type, complexion, diet and smoking as radios. */
function RadioRow({
  label,
  required,
  options,
  value,
  onChange,
}: {
  label: string;
  required?: boolean;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <FieldRow label={label} required={required}>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`h-10 rounded-xl border px-4 text-sm font-medium transition-colors ${
              value === option.value
                ? 'gradient-primary border-transparent text-[var(--color-on-primary)]'
                : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)]'
            }`}
            aria-pressed={value === option.value}
          >
            {option.label}
          </button>
        ))}
      </div>
    </FieldRow>
  );
}

function TextareaField({
  label,
  placeholder,
  hint,
  value,
  onChange,
  rows = 4,
  required,
}: {
  label: string;
  placeholder?: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  required?: boolean;
}) {
  return (
    <FieldRow label={label} required={required}>
      <textarea
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full resize-y rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-[var(--color-text)] outline-none transition-colors placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
      />
      {hint && (
        <span className="flex items-start gap-1.5 text-xs text-[var(--color-text-faint)]">
          <Info size={12} className="mt-0.5 shrink-0" />
          {hint}
        </span>
      )}
    </FieldRow>
  );
}

function LegalLink({ href, labelKey }: { href: string; labelKey: string }) {
  const { t } = useLanguage();
  return (
    <Link href={href} className="text-[var(--color-primary-accent)] hover:underline">
      {t(labelKey)}
    </Link>
  );
}
