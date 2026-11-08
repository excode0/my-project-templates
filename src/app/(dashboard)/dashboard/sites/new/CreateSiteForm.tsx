'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, MonitorSmartphone } from 'lucide-react'

interface UserOption {
  id: string
  email: string
  username: string | null
  role: string
}

interface TemplateOption {
  id: string
  name: string
  slug: string
  price: number
}

interface CreateSiteFormProps {
  users: UserOption[]
  templates: TemplateOption[]
}

export function CreateSiteForm({ users, templates }: CreateSiteFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [userId, setUserId] = useState('')
  const [templateId, setTemplateId] = useState('')
  const [subdomain, setSubdomain] = useState('')
  const [customDomain, setCustomDomain] = useState('')

  const selectedTemplate = useMemo(
    () => templates.find((item) => item.id === templateId),
    [templateId, templates]
  )

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/instances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template_id: templateId,
          user_id: userId,
          ...(subdomain.trim() ? { subdomain: subdomain.trim() } : {}),
          ...(customDomain.trim()
            ? { custom_domain: customDomain.trim() }
            : {}),
        }),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to create site')
      }

      const instanceId = data.data?.id
      router.push(
        (instanceId ? `/editor/${instanceId}` : '/dashboard/sites') as any
      )
      router.refresh()
    } catch (err: any) {
      setError(err?.message || 'Failed to create site')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Owner
          </label>
          <select
            required
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
            disabled={loading}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          >
            <option value="">Select a user</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.username ? `${user.username} · ` : ''}
                {user.email} ({user.role.replace('_', ' ')})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Template
          </label>
          <select
            required
            value={templateId}
            onChange={(event) => setTemplateId(event.target.value)}
            disabled={loading}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          >
            <option value="">Select a template</option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name} ({template.slug})
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedTemplate && (
        <div className="flex items-center gap-3 rounded-xl border border-orange-100 bg-orange-50/60 px-4 py-3 text-sm text-orange-800">
          <MonitorSmartphone className="h-4 w-4" />
          <span>
            Selected <strong>{selectedTemplate.name}</strong>. A complimentary
            completed purchase will be created for the owner.
          </span>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Subdomain <span className="text-slate-400">(optional)</span>
          </label>
          <div className="flex items-center overflow-hidden rounded-xl border border-slate-200 bg-white focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100">
            <input
              value={subdomain}
              onChange={(event) => setSubdomain(event.target.value)}
              disabled={loading}
              placeholder="my-site"
              className="min-w-0 flex-1 px-3 py-2.5 text-sm text-slate-900 outline-none"
            />
            <span className="border-l border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-500">
              .korex.site
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Leave blank to auto-generate a unique subdomain.
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Custom domain <span className="text-slate-400">(optional)</span>
          </label>
          <input
            value={customDomain}
            onChange={(event) => setCustomDomain(event.target.value)}
            disabled={loading}
            placeholder="www.example.com"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          />
          <p className="mt-1 text-xs text-slate-500">
            DNS verification is available from the site&apos;s domain settings.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="submit"
          disabled={loading || !userId || !templateId}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-900/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MonitorSmartphone className="h-4 w-4" />
          )}
          {loading ? 'Creating site...' : 'Create site & open editor'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/dashboard/sites' as any)}
          disabled={loading}
          className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 disabled:opacity-60"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
