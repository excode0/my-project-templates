'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Brush,
  ExternalLink,
  LayoutTemplate,
  Loader2,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  EmptyState,
  PageHeader,
  PageShell,
  SearchField,
  SelectField,
  StatCard,
  StatusBadge,
  TableShell,
  Toolbar,
  btnGhostClass,
  btnPrimaryClass,
  btnSecondaryClass,
  tdClass,
  thClass,
} from '@/components/dashboard/ui'

interface EditorTemplate {
  id: string
  name: string
  slug: string
  type: 'editor' | 'hardcode'
  status: string
  category: string
  previewImage: string | null
  updatedAt: string | null
  instanceCount: number
  slotCount: number
}

interface AdminEditorClientProps {
  templates: EditorTemplate[]
}

function formatDate(value: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function AdminEditorClient({ templates }: AdminEditorClientProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [type, setType] = useState('all')
  const [status, setStatus] = useState('all')
  const [promoting, setPromoting] = useState<string | null>(null)
  const [error, setError] = useState('')

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()

    return templates.filter((template) => {
      if (type !== 'all' && template.type !== type) return false
      if (status !== 'all' && template.status !== status) return false
      if (
        term &&
        ![template.name, template.slug, template.category]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(term))
      ) {
        return false
      }
      return true
    })
  }, [templates, search, type, status])

  const stats = useMemo(
    () => ({
      total: templates.length,
      editor: templates.filter((template) => template.type === 'editor').length,
      hardcode: templates.filter((template) => template.type === 'hardcode')
        .length,
      configured: templates.filter((template) => template.slotCount > 0).length,
    }),
    [templates]
  )

  const promoteToEditor = async (template: EditorTemplate) => {
    setPromoting(template.id)
    setError('')

    try {
      const response = await fetch(`/api/admin/templates/${template.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'editor' }),
      })
      const data = await response.json().catch(() => null)

      if (!response.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to update template')
      }

      router.refresh()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to update template'
      )
    } finally {
      setPromoting(null)
    }
  }

  return (
    <PageShell>
      <PageHeader
        eyebrow="Control Center"
        title="Template editor"
        description="Design the default look and content of a template. New sites inherit these values when they are created."
        actions={
          <Link href="/dashboard/templates" className={btnSecondaryClass}>
            <LayoutTemplate className="h-4 w-4" />
            Template management
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="All templates" value={stats.total} tone="orange" />
        <StatCard
          label="Visual editor"
          value={stats.editor}
          hint="Editable from this hub"
          tone="violet"
        />
        <StatCard
          label="Hardcoded"
          value={stats.hardcode}
          hint="Can be switched to editor"
        />
        <StatCard
          label="Configured"
          value={stats.configured}
          hint="Have saved slot values"
          tone="emerald"
        />
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <TableShell>
        <Toolbar>
          <SearchField
            value={search}
            onChange={setSearch}
            placeholder="Search name, slug, or category"
          />
          <SelectField
            label="Filter by editor type"
            value={type}
            onChange={setType}
          >
            <option value="all">All types</option>
            <option value="editor">Visual editor</option>
            <option value="hardcode">Hardcoded</option>
          </SelectField>
          <SelectField
            label="Filter by status"
            value={status}
            onChange={setStatus}
          >
            <option value="all">All statuses</option>
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
            <option value="review">In review</option>
            <option value="approved">Approved</option>
            <option value="published">Published</option>
            <option value="rejected">Rejected</option>
          </SelectField>
        </Toolbar>

        <thead className="bg-slate-50/70">
          <tr>
            <th className={thClass}>Template</th>
            <th className={thClass}>Editor</th>
            <th className={thClass}>Status</th>
            <th className={thClass}>Slots</th>
            <th className={thClass}>Sites</th>
            <th className={thClass}>Updated</th>
            <th className={cn(thClass, 'text-right')}>Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={7}>
                <EmptyState
                  icon={Brush}
                  title="No templates match your filters"
                  description="Change the search term or filters, or create a new template first."
                />
              </td>
            </tr>
          ) : (
            filtered.map((template) => (
              <tr key={template.id} className="hover:bg-slate-50/60">
                <td className={tdClass}>
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg bg-slate-100 text-slate-400">
                      {template.previewImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={template.previewImage}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <LayoutTemplate className="h-4 w-4" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="truncate font-medium text-slate-900">
                          {template.name}
                        </p>
                        {template.slotCount > 0 ? (
                          <Sparkles
                            className="h-3.5 w-3.5 shrink-0 text-amber-500"
                            aria-label="Has configured slots"
                          />
                        ) : null}
                      </div>
                      <p className="truncate font-mono text-xs text-slate-400">
                        {template.slug}
                      </p>
                    </div>
                  </div>
                </td>
                <td className={tdClass}>
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ring-1 ring-inset',
                      template.type === 'editor'
                        ? 'bg-violet-50 text-violet-700 ring-violet-200'
                        : 'bg-slate-100 text-slate-600 ring-slate-200'
                    )}
                  >
                    {template.type === 'editor' ? 'Visual editor' : 'Hardcoded'}
                  </span>
                </td>
                <td className={cn(tdClass, 'whitespace-nowrap')}>
                  <StatusBadge status={template.status} />
                </td>
                <td
                  className={cn(
                    tdClass,
                    'whitespace-nowrap tabular-nums text-slate-600'
                  )}
                >
                  {template.slotCount}
                </td>
                <td
                  className={cn(
                    tdClass,
                    'whitespace-nowrap tabular-nums text-slate-600'
                  )}
                >
                  {template.instanceCount}
                </td>
                <td
                  className={cn(
                    tdClass,
                    'whitespace-nowrap text-xs text-slate-500'
                  )}
                >
                  {formatDate(template.updatedAt)}
                </td>
                <td className={cn(tdClass, 'whitespace-nowrap text-right')}>
                  <div className="inline-flex items-center gap-1.5">
                    <Link
                      href={`/editor/template/${template.id}` as any}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(btnPrimaryClass, 'px-3 py-1.5 text-xs')}
                    >
                      <Brush className="h-3.5 w-3.5" />
                      Open editor
                    </Link>
                    {template.type === 'hardcode' ? (
                      <button
                        type="button"
                        onClick={() => promoteToEditor(template)}
                        disabled={promoting === template.id}
                        className={cn(
                          btnSecondaryClass,
                          'px-3 py-1.5 text-xs'
                        )}
                      >
                        {promoting === template.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Brush className="h-3.5 w-3.5" />
                        )}
                        Use editor
                      </button>
                    ) : null}
                    <Link
                      href={`/preview/template/${template.id}` as any}
                      target="_blank"
                      className={cn(btnGhostClass, 'px-2 py-1.5')}
                      aria-label={`Preview ${template.name}`}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </TableShell>
    </PageShell>
  )
}
