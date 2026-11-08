'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  AlertCircle,
  Building2,
  Check,
  ExternalLink,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Save,
} from 'lucide-react'
import {
  PageHeader,
  PageShell,
  btnPrimaryClass,
  btnSecondaryClass,
  cardClass,
  inputClass,
} from '@/components/dashboard/ui'
import { cn } from '@/lib/utils'

export interface CompanyProfile {
  id: string
  name: string
  tagline: string
  description: string
  logoUrl: string
  faviconUrl: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  email: string
  phone: string
  address: string
  website: string
  foundedYear: string
  teamSize: string
  mission: string
  values: string
  aboutImageUrl: string
  socialLinks: Record<string, string>
}

interface CompanyIdentityClientProps {
  initialProfile: CompanyProfile
}

const socialFields = [
  { key: 'instagram', label: 'Instagram' },
  { key: 'twitter', label: 'X / Twitter' },
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'facebook', label: 'Facebook' },
  { key: 'youtube', label: 'YouTube' },
  { key: 'github', label: 'GitHub' },
]

function normalizeProfile(profile: CompanyProfile): CompanyProfile {
  const socialLinks = Object.fromEntries(
    Object.entries(profile.socialLinks)
      .map(([key, value]) => [key, value.trim()])
      .filter(([, value]) => value.length > 0)
  )

  return {
    ...profile,
    name: profile.name.trim(),
    tagline: profile.tagline.trim(),
    description: profile.description.trim(),
    logoUrl: profile.logoUrl.trim(),
    faviconUrl: profile.faviconUrl.trim(),
    email: profile.email.trim(),
    phone: profile.phone.trim(),
    address: profile.address.trim(),
    website: profile.website.trim(),
    foundedYear: profile.foundedYear.trim(),
    teamSize: profile.teamSize.trim(),
    mission: profile.mission.trim(),
    values: profile.values.trim(),
    aboutImageUrl: profile.aboutImageUrl.trim(),
    socialLinks,
  }
}

function Field({
  label,
  hint,
  required,
  className,
  children,
}: {
  label: string
  hint?: string
  required?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <label className={cn('block', className)}>
      <span className="text-xs font-semibold text-slate-700">
        {label}
        {required ? <span className="ml-0.5 text-orange-500">*</span> : null}
      </span>
      <div className="mt-1.5">{children}</div>
      {hint ? (
        <span className="mt-1 block text-[11px] text-slate-500">{hint}</span>
      ) : null}
    </label>
  )
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  const colorValue = /^#[0-9a-fA-F]{6}$/.test(value) ? value : '#000000'

  return (
    <Field label={label}>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={colorValue}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-12 shrink-0 cursor-pointer rounded-xl border border-slate-200 bg-white p-1"
          aria-label={`${label} picker`}
        />
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          maxLength={7}
          className={cn(inputClass, 'font-mono uppercase')}
          placeholder="#FF6B35"
        />
      </div>
    </Field>
  )
}

function Preview({ profile }: { profile: CompanyProfile }) {
  const gradientFrom = /^#[0-9a-fA-F]{6}$/.test(profile.primaryColor)
    ? profile.primaryColor
    : '#FF6B35'
  const gradientTo = /^#[0-9a-fA-F]{6}$/.test(profile.secondaryColor)
    ? profile.secondaryColor
    : '#004E89'

  return (
    <aside className="space-y-4 xl:sticky xl:top-24">
      <div className={cn(cardClass, 'overflow-hidden')}>
        <div
          className="relative h-32"
          style={{
            background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
          }}
        >
          <div className="absolute -bottom-7 left-5 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-white text-orange-500 shadow-lg">
            {profile.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.logoUrl}
                alt={`${profile.name || 'Company'} logo`}
                className="h-full w-full object-contain p-1.5"
              />
            ) : (
              <Building2 className="h-7 w-7" />
            )}
          </div>
        </div>

        <div className="px-5 pb-5 pt-10">
          <p className="font-display text-xl font-semibold text-slate-900">
            {profile.name || 'Company name'}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {profile.tagline || 'Your company tagline'}
          </p>

          <div className="mt-4 flex items-center gap-1.5">
            {[profile.primaryColor, profile.secondaryColor, profile.accentColor].map(
              (color, index) => (
                <span
                  key={`${color}-${index}`}
                  className="h-4 w-8 rounded-full border border-black/5"
                  style={{ backgroundColor: color || 'transparent' }}
                  title={color}
                />
              )
            )}
          </div>

          <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-xs text-slate-600">
            <p className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              <span className="truncate">{profile.email || 'Email not set'}</span>
            </p>
            <p className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              <span className="truncate">{profile.phone || 'Phone not set'}</span>
            </p>
            <p className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
              <span>{profile.address || 'Address not set'}</span>
            </p>
          </div>
        </div>
      </div>

      <div className={cn(cardClass, 'p-5')}>
        <p className="text-sm font-semibold text-slate-900">
          Used across public pages
        </p>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">
          The contact page and company branding pull from this record. Saving
          clears the identity cache so changes appear on the next request.
        </p>
        <Link
          href="/contact"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-orange-600 hover:text-orange-700"
        >
          Open public contact page
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>
    </aside>
  )
}

export function CompanyIdentityClient({
  initialProfile,
}: CompanyIdentityClientProps) {
  const router = useRouter()
  const [profile, setProfile] = useState<CompanyProfile>(initialProfile)
  const [baseline, setBaseline] = useState<CompanyProfile>(initialProfile)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [savedAt, setSavedAt] = useState<string | null>(null)

  const dirty = JSON.stringify(profile) !== JSON.stringify(baseline)

  const setField = <K extends keyof CompanyProfile>(
    key: K,
    value: CompanyProfile[K]
  ) => {
    setProfile((current) => ({ ...current, [key]: value }))
    setSavedAt(null)
  }

  const setSocial = (key: string, value: string) => {
    setProfile((current) => ({
      ...current,
      socialLinks: { ...current.socialLinks, [key]: value },
    }))
    setSavedAt(null)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSaving) return

    const normalized = normalizeProfile(profile)
    const foundedYear = normalized.foundedYear
      ? Number(normalized.foundedYear)
      : null

    if (
      foundedYear !== null &&
      (!Number.isInteger(foundedYear) || foundedYear < 1800 || foundedYear > 2100)
    ) {
      setError('Founded year must be a whole number between 1800 and 2100.')
      return
    }

    setIsSaving(true)
    setError('')

    try {
      const response = await fetch('/api/admin/company', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: normalized.name,
          tagline: normalized.tagline || null,
          description: normalized.description || null,
          logoUrl: normalized.logoUrl || null,
          faviconUrl: normalized.faviconUrl || null,
          primaryColor: normalized.primaryColor || null,
          secondaryColor: normalized.secondaryColor || null,
          accentColor: normalized.accentColor || null,
          email: normalized.email || null,
          phone: normalized.phone || null,
          address: normalized.address || null,
          website: normalized.website || null,
          foundedYear,
          teamSize: normalized.teamSize || null,
          mission: normalized.mission || null,
          values: normalized.values || null,
          aboutImageUrl: normalized.aboutImageUrl || null,
          socialLinks: normalized.socialLinks,
        }),
      })
      const data = await response.json().catch(() => null)

      if (!response.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to save company identity')
      }

      setProfile(normalized)
      setBaseline(normalized)
      setSavedAt(new Date().toISOString())
      router.refresh()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to save company identity'
      )
    } finally {
      setIsSaving(false)
    }
  }

  const savedLabel = savedAt
    ? `Saved ${new Date(savedAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })}`
    : null

  return (
    <PageShell>
      <PageHeader
        eyebrow="Control Center"
        title="Company identity"
        description="Manage the public company profile, brand colors, contact details, and story shown across KOREX."
        actions={
          <>
            <Link
              href="/contact"
              target="_blank"
              rel="noopener noreferrer"
              className={btnSecondaryClass}
            >
              <ExternalLink className="h-4 w-4" />
              Public contact
            </Link>
            <button
              type="submit"
              form="company-identity-form"
              disabled={!dirty || isSaving}
              className={btnPrimaryClass}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isSaving ? 'Saving…' : 'Save changes'}
            </button>
          </>
        }
      />

      {error ? (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      ) : null}

      {!error && savedLabel ? (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <Check className="h-4 w-4 shrink-0" />
          {savedLabel}. Public pages will pick up the new identity on their next
          request.
        </div>
      ) : null}

      <form
        id="company-identity-form"
        onSubmit={handleSubmit}
        className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]"
      >
        <div className="space-y-6">
          <section className={cn(cardClass, 'p-5 sm:p-6')}>
            <h2 className="font-display text-xl font-semibold text-slate-900">
              Brand
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              The name, logo, and copy that represent your company.
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Company name" required className="sm:col-span-2">
                <input
                  required
                  value={profile.name}
                  onChange={(event) => setField('name', event.target.value)}
                  className={inputClass}
                  placeholder="Korex"
                />
              </Field>
              <Field label="Tagline" className="sm:col-span-2">
                <input
                  value={profile.tagline}
                  onChange={(event) => setField('tagline', event.target.value)}
                  className={inputClass}
                  placeholder="Premium Template Marketplace"
                />
              </Field>
              <Field label="Description" className="sm:col-span-2">
                <textarea
                  value={profile.description}
                  onChange={(event) =>
                    setField('description', event.target.value)
                  }
                  className={cn(inputClass, 'min-h-28 resize-y')}
                  placeholder="What does your company do?"
                />
              </Field>
              <Field
                label="Logo URL"
                hint="Use a public URL or a path such as /logo1.png"
              >
                <input
                  value={profile.logoUrl}
                  onChange={(event) => setField('logoUrl', event.target.value)}
                  className={inputClass}
                  placeholder="/logo1.png"
                />
              </Field>
              <Field label="Favicon URL">
                <input
                  value={profile.faviconUrl}
                  onChange={(event) => setField('faviconUrl', event.target.value)}
                  className={inputClass}
                  placeholder="/favicon.ico"
                />
              </Field>
              <Field label="About image URL" className="sm:col-span-2">
                <input
                  value={profile.aboutImageUrl}
                  onChange={(event) =>
                    setField('aboutImageUrl', event.target.value)
                  }
                  className={inputClass}
                  placeholder="https://..."
                />
              </Field>
            </div>
          </section>

          <section className={cn(cardClass, 'p-5 sm:p-6')}>
            <h2 className="font-display text-xl font-semibold text-slate-900">
              Brand colors
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              These colors are used for company-level accents and public
              branding.
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <ColorField
                label="Primary"
                value={profile.primaryColor}
                onChange={(value) => setField('primaryColor', value)}
              />
              <ColorField
                label="Secondary"
                value={profile.secondaryColor}
                onChange={(value) => setField('secondaryColor', value)}
              />
              <ColorField
                label="Accent"
                value={profile.accentColor}
                onChange={(value) => setField('accentColor', value)}
              />
            </div>
          </section>

          <section className={cn(cardClass, 'p-5 sm:p-6')}>
            <h2 className="font-display text-xl font-semibold text-slate-900">
              Contact
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Public contact details used by the contact page and footer.
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Email">
                <input
                  type="email"
                  value={profile.email}
                  onChange={(event) => setField('email', event.target.value)}
                  className={inputClass}
                  placeholder="hello@korex.studio"
                />
              </Field>
              <Field label="Phone">
                <input
                  value={profile.phone}
                  onChange={(event) => setField('phone', event.target.value)}
                  className={inputClass}
                  placeholder="+62 812 3456 7890"
                  maxLength={20}
                />
              </Field>
              <Field label="Website">
                <input
                  type="url"
                  value={profile.website}
                  onChange={(event) => setField('website', event.target.value)}
                  className={inputClass}
                  placeholder="https://korex.studio"
                />
              </Field>
              <Field label="Team size">
                <input
                  value={profile.teamSize}
                  onChange={(event) => setField('teamSize', event.target.value)}
                  className={inputClass}
                  placeholder="10-50"
                  maxLength={50}
                />
              </Field>
              <Field label="Address" className="sm:col-span-2">
                <textarea
                  value={profile.address}
                  onChange={(event) => setField('address', event.target.value)}
                  className={cn(inputClass, 'min-h-20 resize-y')}
                  placeholder="Jakarta, Indonesia"
                />
              </Field>
            </div>
          </section>

          <section className={cn(cardClass, 'p-5 sm:p-6')}>
            <h2 className="font-display text-xl font-semibold text-slate-900">
              Company story
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              The story, mission, and values that shape your public identity.
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Founded year">
                <input
                  type="number"
                  min={1800}
                  max={2100}
                  value={profile.foundedYear}
                  onChange={(event) =>
                    setField('foundedYear', event.target.value)
                  }
                  className={inputClass}
                  placeholder="2024"
                />
              </Field>
              <Field label="Mission" className="sm:col-span-2">
                <textarea
                  value={profile.mission}
                  onChange={(event) => setField('mission', event.target.value)}
                  className={cn(inputClass, 'min-h-24 resize-y')}
                  placeholder="Why does your company exist?"
                />
              </Field>
              <Field label="Values" className="sm:col-span-2">
                <textarea
                  value={profile.values}
                  onChange={(event) => setField('values', event.target.value)}
                  className={cn(inputClass, 'min-h-20 resize-y')}
                  placeholder="Quality, Transparency, Community"
                />
              </Field>
            </div>
          </section>

          <section className={cn(cardClass, 'p-5 sm:p-6')}>
            <h2 className="font-display text-xl font-semibold text-slate-900">
              Social links
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Add the profiles you want shown on public company pages.
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {socialFields.map((field) => (
                <Field key={field.key} label={field.label}>
                  <input
                    value={profile.socialLinks[field.key] || ''}
                    onChange={(event) =>
                      setSocial(field.key, event.target.value)
                    }
                    className={inputClass}
                    placeholder={`https://${field.key}.com/...`}
                  />
                </Field>
              ))}
            </div>
          </section>
        </div>

        <Preview profile={profile} />
      </form>
    </PageShell>
  )
}
