'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { BadgeCheck, Camera, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { CompletionPanel } from '@/components/profile/CompletionPanel';
import { api, ApiError, resolveUploadUrl } from '@/lib/api-client';
import {
  useCurrentUser,
  useDeletePhoto,
  useDistricts,
  useMyProfile,
  useMyVerification,
  useSubmitVerification,
  useUpazilas,
  useUpdateBasics,
  useUploadPhoto,
  useUpsertMyProfile,
} from '@/lib/queries';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import { MAX_IMAGE_SIZE_MB, validateImageFile } from '@/lib/fileValidation';
import type { BloodGroup, Complexion, MaritalStatus, MyProfile, ProfileCreatedBy } from '@/lib/types';
import type { EditProfileTab } from '@/lib/profileFieldMap';
import { cmToFeetInches, feetInchesToCm } from '@/lib/height';

// Backend clamps heightCm to [120, 220] — keep dropdown options within that range.
const HEIGHT_MIN_CM = 120;
const HEIGHT_MAX_CM = 220;
const HEIGHT_FEET_OPTIONS = [4, 5, 6, 7];

const BODY_TYPE_OPTIONS = [
  { value: 'Slim', labelKey: 'editProfile.bodyTypeSlim' },
  { value: 'Athletic', labelKey: 'editProfile.bodyTypeAthletic' },
  { value: 'Average', labelKey: 'editProfile.bodyTypeAverage' },
  { value: 'Heavy', labelKey: 'editProfile.bodyTypeHeavy' },
] as const;

const PROFILE_CREATED_BY_OPTIONS: ProfileCreatedBy[] = ['self', 'parents', 'brother', 'sister', 'relative'];

type Tab = EditProfileTab;

const FIELD_HIGHLIGHT_CLASSES = ['ring-2', 'ring-[var(--color-primary)]', 'ring-offset-2', 'ring-offset-[var(--color-bg)]'];

interface FormState {
  name: string;
  district: string;
  subDistrict: string;
  profession: string;
  education: string;
  motherTongue: string;
  englishComfort: string;
  residencyStatus: string;
  growUpIn: string;
  collegeUniversity: string;
  bio: string;
  religion: string;
  heightCm: string;
  maritalStatus: MaritalStatus;
  profileCreatedBy: ProfileCreatedBy | '';
  fatherOccupation: string;
  motherOccupation: string;
  siblingsCount: string;
  numberOfSisters: string;
  numberOfBrothers: string;
  bloodGroup: BloodGroup | '';
  complexion: Complexion | '';
  monthlyIncome: string;
  companyName: string;
  presentAddress: string;
  permanentAddress: string;
  hobbies: string;
  familyFinancialStatus: string;
  bodyType: string;
  partnerPreferences: string;
}

function emptyForm(): FormState {
  return {
    name: '',
    district: '',
    subDistrict: '',
    profession: '',
    education: '',
    motherTongue: '',
    englishComfort: '',
    residencyStatus: '',
    growUpIn: '',
    collegeUniversity: '',
    bio: '',
    religion: '',
    heightCm: '',
    maritalStatus: 'single',
    profileCreatedBy: '',
    fatherOccupation: '',
    motherOccupation: '',
    siblingsCount: '',
    numberOfSisters: '',
    numberOfBrothers: '',
    bloodGroup: '',
    complexion: '',
    monthlyIncome: '',
    companyName: '',
    presentAddress: '',
    permanentAddress: '',
    hobbies: '',
    familyFinancialStatus: '',
    bodyType: '',
    partnerPreferences: '',
  };
}

function fillForm(profile: MyProfile): FormState {
  return {
    name: profile.name ?? '',
    district: profile.district ?? '',
    subDistrict: profile.subDistrict ?? '',
    profession: profile.profession ?? '',
    education: profile.education ?? '',
    motherTongue: profile.motherTongue ?? '',
    englishComfort: profile.englishComfort ?? '',
    residencyStatus: profile.residencyStatus ?? '',
    growUpIn: profile.growUpIn ?? '',
    collegeUniversity: profile.collegeUniversity ?? '',
    bio: profile.bio ?? '',
    religion: profile.religion ?? '',
    heightCm: profile.heightCm ? String(profile.heightCm) : '',
    maritalStatus: profile.maritalStatus ?? 'single',
    profileCreatedBy: profile.profileCreatedBy ?? '',
    fatherOccupation: profile.fatherOccupation ?? '',
    motherOccupation: profile.motherOccupation ?? '',
    siblingsCount: profile.siblingsCount != null ? String(profile.siblingsCount) : '',
    numberOfSisters: profile.numberOfSisters != null ? String(profile.numberOfSisters) : '',
    numberOfBrothers: profile.numberOfBrothers != null ? String(profile.numberOfBrothers) : '',
    bloodGroup: profile.bloodGroup ?? '',
    complexion: profile.complexion ?? '',
    monthlyIncome: profile.monthlyIncome != null ? String(profile.monthlyIncome) : '',
    companyName: profile.companyName ?? '',
    presentAddress: profile.presentAddress ?? '',
    permanentAddress: profile.permanentAddress ?? '',
    hobbies: profile.hobbies ?? '',
    familyFinancialStatus: profile.familyFinancialStatus ?? '',
    bodyType: profile.bodyType ?? '',
    partnerPreferences: profile.partnerPreferences ?? '',
  };
}

function EditProfileContent() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as Tab) ?? 'basic';
  const [tab, setTab] = useState<Tab>(initialTab);

  const { data: profile } = useMyProfile();
  const { data: currentUser } = useCurrentUser();
  const { data: districts } = useDistricts();
  const upsert = useUpsertMyProfile();
  const updateBasics = useUpdateBasics();

  const [form, setForm] = useState<FormState>(emptyForm());
  const { data: upazilas } = useUpazilas(form.district || null);

  useEffect(() => {
    if (profile) setForm(fillForm(profile));
  }, [profile]);

  useEffect(() => {
    const urlTab = searchParams.get('tab') as Tab | null;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (urlTab && urlTab !== tab) setTab(urlTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    const field = searchParams.get('field');
    if (!field) return;
    const container = document.getElementById(`field-${field}`);
    if (!container) return;
    const visibleChild = [...container.querySelectorAll<HTMLElement>('input, select, textarea, button')].find((el) => el.offsetParent !== null);
    const target = container.matches('input, select, textarea') ? container : (visibleChild ?? container);
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    target.focus({ preventScroll: true });
    target.classList.add(...FIELD_HIGHLIGHT_CLASSES);
    router.replace(`/edit-profile?tab=${tab}`);
    const timer = setTimeout(() => target.classList.remove(...FIELD_HIGHLIGHT_CLASSES), 1800);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, tab]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function save() {
    upsert.mutate(
      {
        name: form.name,
        district: form.district,
        subDistrict: form.subDistrict || undefined,
        profession: form.profession || undefined,
        education: form.education || undefined,
        motherTongue: form.motherTongue || undefined,
        englishComfort: form.englishComfort || undefined,
        residencyStatus: form.residencyStatus || undefined,
        growUpIn: form.growUpIn || undefined,
        collegeUniversity: form.collegeUniversity || undefined,
        bio: form.bio || undefined,
        religion: form.religion || undefined,
        heightCm: form.heightCm ? Number(form.heightCm) : undefined,
        maritalStatus: form.maritalStatus,
        profileCreatedBy: form.profileCreatedBy || undefined,
        fatherOccupation: form.fatherOccupation || undefined,
        motherOccupation: form.motherOccupation || undefined,
        siblingsCount: form.siblingsCount !== '' ? Number(form.siblingsCount) : undefined,
        numberOfSisters: form.numberOfSisters !== '' ? Number(form.numberOfSisters) : undefined,
        numberOfBrothers: form.numberOfBrothers !== '' ? Number(form.numberOfBrothers) : undefined,
        bloodGroup: form.bloodGroup || undefined,
        complexion: form.complexion || undefined,
        monthlyIncome: form.monthlyIncome !== '' ? Number(form.monthlyIncome) : undefined,
        companyName: form.companyName || undefined,
        presentAddress: form.presentAddress || undefined,
        permanentAddress: form.permanentAddress || undefined,
        hobbies: form.hobbies || undefined,
        familyFinancialStatus: form.familyFinancialStatus || undefined,
        bodyType: form.bodyType || undefined,
        partnerPreferences: form.partnerPreferences || undefined,
      } as never,
      {
        onSuccess: () => toast.success(t('editProfile.saved')),
        onError: (e) => toast.error(e instanceof ApiError ? String(e.message) : 'Could not save profile'),
      },
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-[var(--color-text)]">{t('editProfile.title')}</h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">{t('editProfile.subtitle')}</p>
        </div>
        <Button onClick={save} loading={upsert.isPending || updateBasics.isPending}>
          {t('common.save')}
        </Button>
      </div>

      <Tabs
        className="mb-5"
        value={tab}
        onChange={(v) => setTab(v as Tab)}
        items={[
          { value: 'basic', label: t('editProfile.tabBasic') },
          { value: 'photos', label: t('editProfile.tabPhotos') },
          { value: 'personal', label: t('editProfile.tabPersonal') },
          { value: 'lifestyle', label: t('editProfile.tabLifestyle') },
          { value: 'partner', label: t('editProfile.tabPartner') },
          { value: 'verification', label: t('editProfile.tabVerification') },
          { value: 'privacy', label: t('editProfile.tabPrivacy') },
        ]}
      />

      {profile && (
        <div className="mb-5">
          <CompletionPanel percent={profile.completionPercent} missingFields={profile.missingFields} maxVisible={6} />
        </div>
      )}

      {tab === 'basic' && (
        <div className="flex flex-col gap-4">
          <Input id="field-name" label={t('auth.register.name')} required placeholder="e.g. Ziaul Haque" value={form.name} onChange={(e) => set('name', e.target.value)} />
          <Input
            label={t('editProfile.age')}
            type="number"
            value={currentUser?.dob ? String(calcAge(currentUser.dob)) : ''}
            disabled
          />
          <div id="field-district">
            <SearchableSelect
              label={t('auth.register.district')}
              placeholder={t('auth.register.selectDistrict')}
              value={form.district}
              onChange={(next) => {
                set('district', next);
                set('subDistrict', '');
              }}
              options={districts?.map((d) => d.name) ?? []}
            />
          </div>
          <div id="field-subDistrict">
            <SearchableSelect
              label={t('auth.register.subDistrict')}
              placeholder={t('auth.register.selectSubDistrict')}
              value={form.subDistrict}
              onChange={(next) => set('subDistrict', next)}
              disabled={!form.district}
              options={upazilas ?? []}
            />
          </div>
          <Input id="field-education" label={t('profileDetail.education')} placeholder="e.g. Bachelor's in CSE" value={form.education} onChange={(e) => set('education', e.target.value)} />
          <Input id="field-profession" label={t('profileDetail.profession')} placeholder="e.g. Software Engineer" value={form.profession} onChange={(e) => set('profession', e.target.value)} />
          <Select
            id="field-maritalStatus"
            label={t('profileDetail.maritalStatus')}
            value={form.maritalStatus}
            onChange={(e) => set('maritalStatus', e.target.value as MaritalStatus)}
          >
            {(['single', 'divorced', 'widowed'] as const).map((s) => (
              <option key={s} value={s}>
                {t(`profileDetail.${s}`)}
              </option>
            ))}
          </Select>
          <Select
            id="field-profileCreatedBy"
            label={t('auth.register.profileCreatedBy')}
            placeholder="—"
            value={form.profileCreatedBy}
            onChange={(e) => set('profileCreatedBy', e.target.value as ProfileCreatedBy)}
          >
            {PROFILE_CREATED_BY_OPTIONS.map((v) => (
              <option key={v} value={v}>
                {t(`auth.register.profileCreatedBy${v.charAt(0).toUpperCase()}${v.slice(1)}`)}
              </option>
            ))}
          </Select>
          <Input id="field-motherTongue" label={t('editProfile.motherTongue')} placeholder="e.g. Bangla" value={form.motherTongue} onChange={(e) => set('motherTongue', e.target.value)} />
          <Input id="field-englishComfort" label={t('editProfile.englishComfort')} placeholder="e.g. Fluent, Basic" value={form.englishComfort} onChange={(e) => set('englishComfort', e.target.value)} />
          <Input id="field-residencyStatus" label={t('editProfile.residencyStatus')} placeholder="e.g. Local, Permanent Resident" value={form.residencyStatus} onChange={(e) => set('residencyStatus', e.target.value)} />
          <Input id="field-growUpIn" label={t('editProfile.growUpIn')} placeholder="e.g. Dhaka, Bangladesh" value={form.growUpIn} onChange={(e) => set('growUpIn', e.target.value)} />
          <Input
            id="field-collegeUniversity"
            label={t('editProfile.collegeUniversity')}
            placeholder="e.g. University of Dhaka, BUET, NSU"
            value={form.collegeUniversity}
            onChange={(e) => set('collegeUniversity', e.target.value)}
          />
          <div id="field-bio" className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--color-text-muted)]">{t('editProfile.aboutHer')}</label>
            <textarea
              value={form.bio}
              onChange={(e) => set('bio', e.target.value)}
              rows={4}
              placeholder={t('editProfile.aboutHerPlaceholder')}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
            />
          </div>
        </div>
      )}

      {tab === 'photos' && <PhotosTab />}

      {tab === 'personal' && (
        <div className="flex flex-col gap-4">
          <Input id="field-religion" label={t('profileDetail.religion')} placeholder="e.g. Islam" value={form.religion} onChange={(e) => set('religion', e.target.value)} />
          <HeightSelect id="field-heightCm" label={t('profileDetail.height')} valueCm={form.heightCm} onChange={(cm) => set('heightCm', cm)} />
          <Input id="field-fatherOccupation" label={t('profileDetail.fatherOccupation')} placeholder="e.g. Retired Govt. Officer" value={form.fatherOccupation} onChange={(e) => set('fatherOccupation', e.target.value)} />
          <Input id="field-motherOccupation" label={t('profileDetail.motherOccupation')} placeholder="e.g. Homemaker" value={form.motherOccupation} onChange={(e) => set('motherOccupation', e.target.value)} />
          <Input id="field-siblingsCount" label={t('profileDetail.siblings')} type="number" placeholder="e.g. 3" value={form.siblingsCount} onChange={(e) => set('siblingsCount', e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Input id="field-numberOfSisters" label={t('browse.gateMissing.numberOfSisters')} type="number" placeholder="e.g. 1" value={form.numberOfSisters} onChange={(e) => set('numberOfSisters', e.target.value)} />
            <Input id="field-numberOfBrothers" label={t('browse.gateMissing.numberOfBrothers')} type="number" placeholder="e.g. 2" value={form.numberOfBrothers} onChange={(e) => set('numberOfBrothers', e.target.value)} />
          </div>
          <Select id="field-bloodGroup" label={t('profileDetail.bloodGroup')} placeholder="—" value={form.bloodGroup} onChange={(e) => set('bloodGroup', e.target.value as BloodGroup)}>
            {(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const).map((bg) => (
              <option key={bg} value={bg}>
                {bg}
              </option>
            ))}
          </Select>
          <Select id="field-complexion" label={t('profileDetail.complexion')} placeholder="—" value={form.complexion} onChange={(e) => set('complexion', e.target.value as Complexion)}>
            {(['fair', 'medium', 'dark'] as const).map((c) => (
              <option key={c} value={c}>
                {t(`profileDetail.complexion${c.charAt(0).toUpperCase()}${c.slice(1)}`)}
              </option>
            ))}
          </Select>
          <Input id="field-monthlyIncome" label={t('profileDetail.monthlyIncome')} type="number" placeholder="e.g. 50000" value={form.monthlyIncome} onChange={(e) => set('monthlyIncome', e.target.value)} />
          <Input id="field-companyName" label={t('profileDetail.company')} placeholder="e.g. ABC Ltd." value={form.companyName} onChange={(e) => set('companyName', e.target.value)} />
          <div id="field-presentAddress" className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--color-text-muted)]">{t('profileDetail.presentAddress')}</label>
            <textarea
              value={form.presentAddress}
              onChange={(e) => set('presentAddress', e.target.value)}
              rows={2}
              placeholder="e.g. House 12, Road 5, Dhanmondi, Dhaka"
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
            />
          </div>
          <div id="field-permanentAddress" className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--color-text-muted)]">{t('profileDetail.permanentAddress')}</label>
            <textarea
              value={form.permanentAddress}
              onChange={(e) => set('permanentAddress', e.target.value)}
              rows={2}
              placeholder="e.g. Village: Rampur, Upazila: Sadar, District: Comilla"
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
            />
          </div>
        </div>
      )}

      {tab === 'lifestyle' && (
        <div className="flex flex-col gap-4">
          <div id="field-hobbies" className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--color-text-muted)]">{t('editProfile.hobbies')}</label>
            <textarea
              value={form.hobbies}
              onChange={(e) => set('hobbies', e.target.value)}
              rows={3}
              placeholder="e.g. Reading, cooking, traveling"
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
            />
          </div>
          <Input id="field-familyFinancialStatus" label={t('editProfile.familyFinancialStatus')} placeholder="e.g. Middle class" value={form.familyFinancialStatus} onChange={(e) => set('familyFinancialStatus', e.target.value)} />
          <Select id="field-bodyType" label={t('editProfile.bodyType')} placeholder="—" value={form.bodyType} onChange={(e) => set('bodyType', e.target.value)}>
            {BODY_TYPE_OPTIONS.map(({ value, labelKey }) => (
              <option key={value} value={value}>
                {t(labelKey)}
              </option>
            ))}
          </Select>
        </div>
      )}

      {tab === 'partner' && (
        <div id="field-partnerPreferences" className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[var(--color-text-muted)]">{t('editProfile.partnerPreferences')}</label>
          <textarea
            value={form.partnerPreferences}
            onChange={(e) => set('partnerPreferences', e.target.value)}
            rows={6}
            placeholder={t('editProfile.partnerPreferencesPlaceholder')}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
          />
        </div>
      )}

      {tab === 'verification' && <VerificationTab />}
      {tab === 'privacy' && <PrivacyTab />}
    </div>
  );
}

export default function EditProfilePage() {
  return (
    <Suspense fallback={null}>
      <EditProfileContent />
    </Suspense>
  );
}

function HeightSelect({
  id,
  label,
  valueCm,
  onChange,
}: {
  id: string;
  label: string;
  valueCm: string;
  onChange: (cm: string) => void;
}) {
  const { t } = useLanguage();
  const cmNumber = valueCm !== '' ? Number(valueCm) : null;
  const { feet, inches } = cmNumber != null ? cmToFeetInches(cmNumber) : { feet: NaN, inches: NaN };
  const inchOptions = Array.from({ length: 12 }, (_, i) => i).filter((inch) => {
    const cm = feetInchesToCm(Number.isNaN(feet) ? HEIGHT_FEET_OPTIONS[0] : feet, inch);
    return cm >= HEIGHT_MIN_CM && cm <= HEIGHT_MAX_CM;
  });

  function update(nextFeet: number, nextInches: number) {
    const cm = feetInchesToCm(nextFeet, nextInches);
    onChange(Number.isNaN(nextFeet) || Number.isNaN(nextInches) ? '' : String(Math.min(Math.max(cm, HEIGHT_MIN_CM), HEIGHT_MAX_CM)));
  }

  return (
    <div id={id} className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-[var(--color-text-muted)]">{label}</label>
      <div className="grid grid-cols-2 gap-3">
        <Select
          aria-label={t('editProfile.heightFeet')}
          placeholder={t('editProfile.heightFeet')}
          value={Number.isNaN(feet) ? '' : String(feet)}
          onChange={(e) => update(Number(e.target.value), Number.isNaN(inches) ? 0 : inches)}
        >
          {HEIGHT_FEET_OPTIONS.map((ft) => (
            <option key={ft} value={ft}>
              {ft} {t('editProfile.feet')}
            </option>
          ))}
        </Select>
        <Select
          aria-label={t('editProfile.heightInches')}
          placeholder={t('editProfile.heightInches')}
          value={Number.isNaN(inches) ? '' : String(inches)}
          onChange={(e) => update(Number.isNaN(feet) ? HEIGHT_FEET_OPTIONS[0] : feet, Number(e.target.value))}
        >
          {inchOptions.map((inch) => (
            <option key={inch} value={inch}>
              {inch} {t('editProfile.inch')}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}

function calcAge(dob: string): number {
  const birth = new Date(dob);
  const diff = Date.now() - birth.getTime();
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
}

function PhotosTab() {
  const { t } = useLanguage();
  const { data: profile } = useMyProfile();
  const uploadPhoto = useUploadPhoto();
  const deletePhoto = useDeletePhoto();

  if (!profile) {
    return <p className="text-sm text-[var(--color-text-muted)]">{t('editProfile.savePhotosFirst')}</p>;
  }

  return (
    <Card className="p-4">
      <div className="flex flex-wrap gap-3">
        {profile.photos.map((photo) => (
          <div key={photo.id} className="group relative h-28 w-28 overflow-hidden rounded-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={resolveUploadUrl(photo.url) ?? ''} alt="" className="h-full w-full object-cover" />
            <button
              onClick={() => deletePhoto.mutate(photo.id)}
              className="absolute inset-0 flex items-center justify-center bg-[var(--color-scrim)] opacity-0 transition-opacity group-hover:opacity-100"
            >
              <Trash2 size={18} className="text-[var(--color-on-primary)]" />
            </button>
          </div>
        ))}
        <label id="field-photo" className="flex h-28 w-28 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-[var(--color-border)] text-[var(--color-text-faint)]">
          <Camera size={20} />
          <span className="text-xs">{t('editProfile.addPhoto')}</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = '';
              if (!file) return;
              const result = validateImageFile(file);
              if (!result.ok) {
                toast.error(
                  result.reason === 'size' ? t('common.imageTooLarge', { size: MAX_IMAGE_SIZE_MB }) : t('common.imageInvalidType'),
                );
                return;
              }
              uploadPhoto.mutate(file, { onError: (e) => toast.error(e instanceof ApiError ? String(e.message) : 'Could not upload photo') });
            }}
          />
        </label>
      </div>
      <p className="mt-2 text-xs text-[var(--color-text-faint)]">{t('common.imageSizeHint', { size: MAX_IMAGE_SIZE_MB })}</p>
    </Card>
  );
}

function VerificationTab() {
  const { t } = useLanguage();
  const { data: verification, isLoading } = useMyVerification();
  const submit = useSubmitVerification();
  const [nidNumber, setNidNumber] = useState('');
  const [selfie, setSelfie] = useState<File | null>(null);

  if (isLoading) return <div className="pt-6 text-center text-[var(--color-text-muted)]">{t('common.loading')}</div>;

  if (verification?.status === 'approved') {
    return (
      <Card className="flex flex-col items-center gap-2 p-6 text-center">
        <BadgeCheck size={32} className="text-[var(--color-primary-accent)]" />
        <p className="font-display text-lg text-[var(--color-text)]">{t('verification.approvedTitle')}</p>
        <p className="text-sm text-[var(--color-text-muted)]">{t('verification.approvedBody')}</p>
      </Card>
    );
  }

  if (verification?.status === 'pending') {
    return (
      <Card className="flex flex-col items-center gap-2 p-6 text-center">
        <p className="font-display text-lg text-[var(--color-text)]">{t('verification.pendingTitle')}</p>
        <p className="text-sm text-[var(--color-text-muted)]">{t('verification.pendingBody')}</p>
      </Card>
    );
  }

  const isValid = /^\d{10}$|^\d{13}$|^\d{17}$/.test(nidNumber.trim()) && !!selfie;

  function handleSelfieChange(file: File | null) {
    if (!file) {
      setSelfie(null);
      return;
    }
    const result = validateImageFile(file);
    if (!result.ok) {
      toast.error(
        result.reason === 'size' ? t('common.imageTooLarge', { size: MAX_IMAGE_SIZE_MB }) : t('common.imageInvalidType'),
      );
      return;
    }
    setSelfie(file);
  }

  return (
    <div className="flex flex-col gap-4">
      <Input label={t('verification.nidNumber')} required placeholder={t('verification.nidPlaceholder')} value={nidNumber} onChange={(e) => setNidNumber(e.target.value.replace(/\D/g, ''))} />
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[var(--color-text-muted)]">
          {t('verification.selfie')} <span className="text-[var(--color-danger)]"> *</span>
        </label>
        <label className="flex h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--color-border)] text-[var(--color-text-faint)]">
          <Camera size={24} />
          <span className="text-xs">{selfie ? selfie.name : t('verification.selfie')}</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleSelfieChange(e.target.files?.[0] ?? null)}
          />
        </label>
        <p className="text-center text-xs text-[var(--color-text-faint)]">{t('common.imageSizeHint', { size: MAX_IMAGE_SIZE_MB })}</p>
      </div>
      <Button
        onClick={() =>
          nidNumber &&
          selfie &&
          submit.mutate(
            { nidNumber: nidNumber.trim(), selfie },
            { onSuccess: () => toast.success('Submitted for review'), onError: (e) => toast.error(e instanceof ApiError ? String(e.message) : 'Could not submit') },
          )
        }
        loading={submit.isPending}
        disabled={!isValid}
      >
        {t('verification.submit')}
      </Button>
    </div>
  );
}

function PrivacyTab() {
  const { t } = useLanguage();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const mutation = useMutation({
    mutationFn: () => api.patch('users/me/password', { currentPassword, newPassword }),
    onSuccess: () => {
      toast.success(t('settings.updatePassword'));
      setCurrentPassword('');
      setNewPassword('');
    },
    onError: (e) => toast.error(e instanceof ApiError ? String(e.message) : 'Could not update password'),
  });

  return (
    <div className="flex max-w-sm flex-col gap-3">
      <Input label={t('settings.currentPassword')} type="password" required placeholder="••••••••" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
      <Input label={t('settings.newPassword')} type="password" required placeholder="At least 8 characters" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
      <Button onClick={() => mutation.mutate()} loading={mutation.isPending}>
        {t('settings.updatePassword')}
      </Button>
    </div>
  );
}
