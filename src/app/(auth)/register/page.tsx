'use client';

import { Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Info, MapPin, UserRound } from 'lucide-react';
import { AuthShell } from '@/components/auth/AuthShell';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { RichText } from '@/components/ui/RichText';
import { LocationPicker } from '@/components/ui/LocationPicker';
import { DobPicker } from '@/components/ui/DobPicker';
import { AvatarPicker } from '@/components/ui/AvatarPicker';
import { EMPTY_PHONE, PhoneInput, formatPhone, type PhoneValue } from '@/components/ui/PhoneInput';
import { api, ApiError } from '@/lib/api-client';
import { useCurrentUser, useMyProfile } from '@/lib/queries';
import { setToken } from '@/lib/auth-token';
import { EMPTY_LOCATION, type ProfileLocation } from '@/lib/geo';
import { feetInchesToCm } from '@/lib/height';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import { useOptionLabel } from '@/lib/profileOptionLabels';
import {
  MARITAL_STATUSES,
  PARENT_STATUSES,
  PROFESSIONAL_AREAS,
  RELIGIONS,
  enumKey,
} from '@/lib/profileOptions';
import type { AuthResponse, Gender } from '@/lib/types';

/**
 * Registration is three screens and nothing more:
 *
 *   1. account  — photo, gender, phone, email, password. Creates the account.
 *   2. basic    — name, marital status, religion, profession, date of birth,
 *                 height, a short bio. Creates the profile.
 *   3. family   — where they live, and the family block.
 *
 * Every other profile column still exists and is still shown, edited and
 * searched everywhere it was before — it is simply not asked for here. Members
 * fill those in afterwards from Edit Profile, prompted by the completion panel
 * on the dashboard.
 *
 * Each screen saves its own slice via `PUT profiles/me`, a partial upsert, so
 * someone who drops out on screen 3 still leaves a usable profile rather than
 * nothing at all.
 */

type Step = 'account' | 'basic' | 'family' | 'done';

const REGISTER_PROGRESS_KEY = 'biyekoralagbe_register_progress';

/** The steps a completed account can be deep-linked back into (`/register?step=`). */
const RESUMABLE_STEPS = ['basic', 'family'] as const;
type ResumableStep = (typeof RESUMABLE_STEPS)[number];

const STEP_PERCENT: Record<Exclude<Step, 'done'>, number> = {
  account: 33,
  basic: 66,
  family: 100,
};

/**
 * One entry per displayed step, not per centimetre.
 *
 * Height is shown in feet and inches but stored in centimetres, and at 2.54cm
 * to the inch several centimetre values round to the same label — so building
 * the list by centimetre produced runs of identical options ("5 feet 6 inch"
 * three times over). Iterating the unit that is actually displayed makes every
 * label appear exactly once, and each still maps to a distinct centimetre value.
 */
const HEIGHT_OPTIONS = (() => {
  const minInches = 4 * 12;
  const maxInches = 7 * 12;
  return Array.from({ length: maxInches - minInches + 1 }, (_, i) => {
    const total = minInches + i;
    const feet = Math.floor(total / 12);
    const inches = total % 12;
    // Feet and inches are kept apart rather than pre-joined into a label:
    // "feet" and "inch" are words that need translating, and this is module
    // scope, where `t` is not available.
    return { cm: feetInchesToCm(feet, inches), feet, inches };
  });
})();

interface WizardForm {
  // 1. Account
  email: string;
  password: string;
  gender: Gender | '';
  // 2. Basic
  name: string;
  dob: string;
  maritalStatus: string;
  religion: string;
  profession: string;
  heightCm: string;
  bio: string;
  // 3. Location & family
  location: ProfileLocation;
  fatherStatus: string;
  fatherOccupation: string;
  motherStatus: string;
  motherOccupation: string;
  /** Guardian / family contact number — who a match rings besides the member. */
  relativePhone: string;
}

const emptyForm = (): WizardForm => ({
  email: '',
  password: '',
  gender: '',
  name: '',
  dob: '',
  maritalStatus: '',
  religion: '',
  profession: '',
  heightCm: '',
  bio: '',
  location: EMPTY_LOCATION,
  fatherStatus: '',
  fatherOccupation: '',
  motherStatus: '',
  motherOccupation: '',
  relativePhone: '',
});

interface StoredProgress {
  step: Step;
  phone: PhoneValue;
  form: WizardForm;
}

/**
 * The wizard reads `useSearchParams`, so everything inside the boundary is left
 * out of the prerendered HTML. The fallback is therefore not a spinner: it is
 * the heading and summary of the page, which is what a crawler (and anyone on a
 * slow connection) sees before hydration replaces it with the form.
 */
function RegisterIntro() {
  const { t } = useLanguage();

  // Rendered inside the same shell the wizard uses, backdrop included: the
  // prerendered HTML and the hydrated form then share a background, so the
  // photography is already painted when the form swaps in rather than fading
  // up a beat later.
  return (
    <AuthShell backdrop>
      <div className="text-center">
        <h1 className="font-display text-2xl text-[var(--color-text)] sm:text-3xl">
          {t('auth.register.introTitle')}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-muted)]">
          {t('auth.register.introBody')}
        </p>
      </div>
    </AuthShell>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterIntro />}>
      <RegisterWizard />
    </Suspense>
  );
}

function RegisterWizard() {
  const { t, locale } = useLanguage();
  const optionLabel = useOptionLabel();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  // An account that already exists can be sent straight back into the wizard
  // with /register?step=basic — read via a lazy initializer (not an effect)
  // since useSearchParams() is safe at render time.
  const requestedStep = searchParams.get('step');
  const hasRequestedStep = RESUMABLE_STEPS.includes(requestedStep as ResumableStep);
  const [step, setStep] = useState<Step>(() =>
    hasRequestedStep ? (requestedStep as Step) : 'account',
  );
  const [phone, setPhone] = useState<PhoneValue>(EMPTY_PHONE);
  const [form, setForm] = useState<WizardForm>(emptyForm);
  const [avatar, setAvatar] = useState<File | null>(null);

  const { data: currentUser } = useCurrentUser(hasRequestedStep);
  const { data: existingProfile } = useMyProfile(hasRequestedStep);
  const [seeded, setSeeded] = useState(false);
  const [restoreChecked, setRestoreChecked] = useState(false);
  const restoredProgress = useRef(false);

  function set<K extends keyof WizardForm>(key: K, value: WizardForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // Resume where it left off after a reload — the account is created on screen
  // one, so losing step state on refresh used to strand people mid-signup. The
  // chosen photo is a File and cannot be persisted, so it always resumes empty.
  useEffect(() => {
    setRestoreChecked(true);
    const raw = sessionStorage.getItem(REGISTER_PROGRESS_KEY);
    if (!raw) return;
    try {
      const saved = JSON.parse(raw) as StoredProgress;
      if (!saved.step || saved.step === 'done') return;
      // An explicit ?step= means we were routed here deliberately; stored
      // progress from an abandoned attempt must not drag the member back to
      // 'account' and ask for an email and password they have already set.
      if (!hasRequestedStep) setStep(saved.step);
      setPhone(saved.phone ?? EMPTY_PHONE);
      restoredProgress.current = true;
      // Spread over a fresh form so a payload stored by an earlier version of
      // this wizard can't leave a newly added field undefined.
      setForm({ ...emptyForm(), ...(saved.form ?? {}) });
    } catch {
      sessionStorage.removeItem(REGISTER_PROGRESS_KEY);
    }
  }, [hasRequestedStep]);

  /**
   * Fills gaps from an account that already exists — an in-render adjustment
   * rather than an effect, since it reacts to fetched data arriving and would
   * otherwise cost a second render pass.
   *
   * Anything the member has typed, or that the restore above refilled, always
   * wins. Waits on `restoreChecked` so a cache hit cannot seed ahead of the
   * restore, which replaces the whole form and would undo it.
   */
  const seedName = existingProfile?.name?.trim() ?? '';
  const seedEmail = currentUser?.email?.trim() ?? '';
  if (hasRequestedStep && restoreChecked && !seeded && (seedName || seedEmail)) {
    setSeeded(true);
    setForm((prev) => ({
      ...prev,
      name: prev.name.trim() ? prev.name : seedName,
      email: prev.email.trim() ? prev.email : seedEmail,
      gender: prev.gender || (currentUser?.gender ?? ''),
    }));
  }

  useEffect(() => {
    if (step === 'done') {
      sessionStorage.removeItem(REGISTER_PROGRESS_KEY);
      return;
    }
    const progress: StoredProgress = { step, phone, form };
    sessionStorage.setItem(REGISTER_PROGRESS_KEY, JSON.stringify(progress));
  }, [step, phone, form]);

  /**
   * Screen one. Gender and the phone number go in with the account rather than
   * being patched on afterwards, so a clash on either is reported here as a
   * field error instead of leaving a half-made account behind.
   */
  const createAccount = useMutation({
    mutationFn: () =>
      api.post<AuthResponse>('auth/register', {
        email: form.email.trim(),
        password: form.password,
        gender: form.gender || undefined,
        phone: formatPhone(phone) || undefined,
      }),
    onSuccess: async (data) => {
      setToken(data.accessToken);
      await queryClient.invalidateQueries({ queryKey: ['me'] });
      setStep('basic');
    },
    onError: (e) =>
      toast.error(e instanceof ApiError ? String(e.message) : t('auth.register.accountError')),
  });

  const uploadAvatar = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return api.post('profiles/me/photos', formData);
    },
  });

  /**
   * Screen two. Date of birth lives on the user record rather than the profile,
   * so this is the one step that touches two endpoints — and it is also where
   * the photo chosen on screen one is finally uploaded, since photos hang off
   * the profile row and the profile cannot exist without a name.
   */
  const saveBasic = useMutation({
    mutationFn: async () => {
      await api.patch('users/me/basics', {
        gender: form.gender || undefined,
        dob: form.dob || undefined,
      });
      await api.put('profiles/me', {
        name: form.name.trim(),
        maritalStatus: form.maritalStatus,
        religion: str(form.religion),
        profession: str(form.profession),
        heightCm: num(form.heightCm),
        bio: form.bio.trim(),
        // Not asked for here — most profiles are the member's own, and anyone
        // running one for a relative can say so in Edit Profile. Sent anyway
        // because it is a scored completion field and leaving it null would
        // hold every new member below the browse threshold.
        profileCreatedBy: 'self',
      });

      if (avatar) {
        // Deliberately last, and deliberately not fatal: the profile is saved
        // by this point, so a rejected image should not cost the member the
        // whole step. They land on screen three either way and the completion
        // panel will ask for a photo.
        try {
          await uploadAvatar.mutateAsync(avatar);
        } catch (e) {
          toast.error(
            e instanceof ApiError ? String(e.message) : t('auth.register.avatarUploadFailed'),
          );
        }
      }
    },
    onSuccess: () => setStep('family'),
    onError: (e) =>
      toast.error(e instanceof ApiError ? String(e.message) : t('auth.register.saveError')),
  });

  /** Screen three: location and the family block, then done. */
  const saveFamily = useMutation({
    mutationFn: () =>
      api.put('profiles/me', {
        country: form.location.country,
        countryCode: form.location.countryCode || undefined,
        state: form.location.state || undefined,
        city: form.location.city || undefined,
        zip: form.location.zip || undefined,
        fatherStatus: form.fatherStatus,
        fatherOccupation: str(form.fatherOccupation),
        motherStatus: form.motherStatus,
        motherOccupation: str(form.motherOccupation),
        // Sibling counts and the family write-up are no longer asked for here.
        // Both still exist on the profile and in Edit Profile's Personal tab —
        // they are simply not part of signing up any more.
        relativePhone: str(form.relativePhone),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['me'] });
      await queryClient.invalidateQueries({ queryKey: ['my-profile'] });
      setStep('done');
    },
    onError: (e) =>
      toast.error(e instanceof ApiError ? String(e.message) : t('auth.register.saveError')),
  });

  /** Numeric profile fields arrive as strings from `<select>`/`<input>`. */
  const num = (value: string): number | undefined => (value === '' ? undefined : Number(value));
  const str = (value: string): string | undefined => value.trim() || undefined;

  // An OAuth account (the routes still exist even though the buttons are gone)
  // reaches screen two without ever seeing screen one, so it has no gender yet.
  const needsGenderHere = step === 'basic' && !form.gender;

  // Each step's Continue button stays enabled rather than silently disabling —
  // clicking it while something's missing toasts `stepRequired` instead of
  // leaving the member to guess which field the button is waiting on.
  const isAccountValid =
    !!avatar &&
    !!form.gender &&
    phone.number.replace(/\D/g, '').length >= 6 &&
    !!form.email.trim() &&
    form.password.length >= 8;

  const isBasicValid =
    !!form.gender &&
    !!form.name.trim() &&
    !!form.maritalStatus &&
    !!form.religion &&
    !!form.profession &&
    !!form.dob &&
    !!form.heightCm &&
    form.bio.trim().length >= 20;

  const isFamilyValid =
    !!form.location.country &&
    !!form.fatherStatus &&
    !!form.fatherOccupation.trim() &&
    !!form.motherStatus &&
    !!form.motherOccupation.trim() &&
    !!form.relativePhone.trim();

  function handleAccountContinue() {
    if (!isAccountValid) {
      toast.error(t('auth.register.stepRequired'));
      return;
    }
    createAccount.mutate();
  }

  function handleBasicContinue() {
    if (!isBasicValid) {
      toast.error(t('auth.register.stepRequired'));
      return;
    }
    saveBasic.mutate();
  }

  function handleFamilyContinue() {
    if (!isFamilyValid) {
      toast.error(t('auth.register.stepRequired'));
      return;
    }
    saveFamily.mutate();
  }

  return (
    <AuthShell wide={step !== 'done'} backdrop>
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.25 }}
        >
          {step === 'account' && (
            <WizardStepShell
              icon={UserRound}
              title={t('auth.register.stepAccountTitle')}
              subtitle={t('auth.register.stepAccountBody')}
              section={t('auth.register.stepAccountSection')}
              percent={STEP_PERCENT.account}
            >
              <div className="flex flex-col gap-4">
                <AvatarPicker
                  file={avatar}
                  onChange={setAvatar}
                  label={t('auth.register.avatarLabel')}
                  hint={t('auth.register.avatarHint')}
                  required
                />

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

                <PhoneInput
                  label={t('auth.register.phoneLabel')}
                  required
                  value={phone}
                  onChange={setPhone}
                  hint={t('auth.register.phoneHint')}
                />

                <Input
                  label={t('auth.register.email')}
                  type="email"
                  required
                  autoComplete="email"
                  placeholder={t('auth.register.emailPlaceholder')}
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                />
                <Input
                  label={t('auth.register.createPassword')}
                  type="password"
                  required
                  autoComplete="new-password"
                  placeholder={t('auth.register.passwordPlaceholder')}
                  value={form.password}
                  onChange={(e) => set('password', e.target.value)}
                />
              </div>

              <Button onClick={handleAccountContinue} loading={createAccount.isPending}>
                {t('common.continue')}
              </Button>

              <p className="text-center text-xs text-[var(--color-text-faint)]">
                <RichText
                  tKey="auth.register.termsNotice"
                  values={{
                    terms: <LegalLink href="/terms" labelKey="contactPage.formConsentTerms" />,
                    privacy: <LegalLink href="/privacy" labelKey="contactPage.formConsentPrivacy" />,
                  }}
                />
              </p>

              <p className="text-center text-xs text-[var(--color-text-muted)]">
                {t('auth.register.alreadyMember')}{' '}
                <Link href="/login" className="text-[var(--color-primary-accent)] hover:underline">
                  {t('auth.register.loginNow')}
                </Link>
              </p>
            </WizardStepShell>
          )}

          {step === 'basic' && (
            <WizardStepShell
              icon={Info}
              title={t('auth.register.stepBasicTitle')}
              subtitle={t('auth.register.stepBasicSubtitle')}
              section={t('auth.register.stepBasicSection')}
              percent={STEP_PERCENT.basic}
            >
              <div className="flex flex-col gap-4">
                {needsGenderHere && (
                  <FieldRow label={t('auth.register.gender')} required>
                    <div className="grid grid-cols-2 gap-2">
                      {(['male', 'female'] as const).map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => set('gender', g)}
                          className="h-11 rounded-xl border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-muted)] transition-colors"
                        >
                          {t(`auth.register.${g}`)}
                        </button>
                      ))}
                    </div>
                  </FieldRow>
                )}

                <Input
                  label={t('auth.register.candidateName')}
                  required
                  placeholder={t('auth.register.namePlaceholder')}
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                />

                <Select
                  label={t('profileDetail.maritalStatus')}
                  required
                  placeholder={t('common.selectPlaceholder')}
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
                  placeholder={t('common.selectPlaceholder')}
                  value={form.religion}
                  onChange={(e) => set('religion', e.target.value)}
                >
                  {RELIGIONS.map((r) => (
                    <option key={r} value={r}>
                      {optionLabel(r)}
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
                      {optionLabel(p)}
                    </option>
                  ))}
                </Select>

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
                  <p className="mt-1.5 text-xs text-[var(--color-text-faint)]">
                    {t('auth.register.dobHint')}
                  </p>
                </div>

                <Select
                  label={t('profileDetail.height')}
                  required
                  placeholder={t('auth.register.selectHeight')}
                  value={form.heightCm}
                  onChange={(e) => set('heightCm', e.target.value)}
                >
                  {HEIGHT_OPTIONS.map((option) => (
                    <option key={option.cm} value={option.cm}>
                      {t('auth.register.heightFormat', {
                        feet: option.feet,
                        inches: option.inches,
                      })}
                    </option>
                  ))}
                </Select>

                <TextareaField
                  label={t('auth.register.writeAboutYourself')}
                  required
                  rows={6}
                  placeholder={t('auth.register.aboutPlaceholder')}
                  hint={t('auth.register.aboutHint')}
                  value={form.bio}
                  onChange={(v) => set('bio', v)}
                />
              </div>

              <StepActions loading={saveBasic.isPending} onContinue={handleBasicContinue} />
            </WizardStepShell>
          )}

          {step === 'family' && (
            <WizardStepShell
              icon={MapPin}
              title={t('auth.register.stepFamilyTitle')}
              subtitle={t('auth.register.stepFamilySubtitle')}
              section={t('auth.register.stepFamilySection')}
              percent={STEP_PERCENT.family}
            >
              <div className="flex flex-col gap-4">
                <LocationPicker required value={form.location} onChange={(v) => set('location', v)} />

                <Select
                  label={t('auth.register.fatherStatus')}
                  required
                  placeholder={t('common.selectPlaceholder')}
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
                  required
                  value={form.fatherOccupation}
                  onChange={(e) => set('fatherOccupation', e.target.value)}
                />
                <Select
                  label={t('auth.register.motherStatus')}
                  required
                  placeholder={t('common.selectPlaceholder')}
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
                  required
                  value={form.motherOccupation}
                  onChange={(e) => set('motherOccupation', e.target.value)}
                />

                {/* Collected for every profile, not just relative-managed ones —
                    families expect a guardian's number on the bio-data, and it
                    is one of the details an unlock pays for. */}
                <Input
                  type="tel"
                  required
                  label={t('auth.register.relativePhone')}
                  placeholder="+8801700000000"
                  value={form.relativePhone}
                  onChange={(e) => set('relativePhone', e.target.value)}
                />
              </div>

              <StepActions
                loading={saveFamily.isPending}
                onBack={() => setStep('basic')}
                continueLabel={t('auth.register.completeRegistration')}
                onContinue={handleFamilyContinue}
              />
            </WizardStepShell>
          )}

          {step === 'done' && (
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-success)]/15 text-[var(--color-success)]">
                <Check size={28} />
              </div>
              <h1 className="font-display text-2xl text-[var(--color-text)]">
                {t('auth.register.pendingTitle')}
              </h1>
              <p className="text-sm text-[var(--color-text-muted)]">{t('auth.register.pendingBody')}</p>

              <div className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-left">
                <p className="text-sm font-semibold text-[var(--color-text)]">
                  {t('auth.register.completePromptTitle')}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-muted)]">
                  {t('auth.register.completePromptBody')}
                </p>
                <Link
                  href="/edit-profile"
                  className="mt-3 inline-block text-sm font-semibold text-[var(--color-primary-accent)] hover:underline"
                >
                  {t('auth.register.completePromptCta')} →
                </Link>
              </div>

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

/** Heading, section strip with an N% meter, body. */
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
  continueLabel,
}: {
  onBack?: () => void;
  onContinue: () => void;
  loading: boolean;
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
      <Button className="flex-1" onClick={onContinue} loading={loading}>
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
