'use client'

import { useEffect, useState, type ReactNode } from 'react'
import type { Route } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  AlertCircle,
  ArrowLeft,
  Check,
  ExternalLink,
  Loader2,
  Maximize2,
  Minimize2,
  Monitor,
  PanelLeft,
  RefreshCw,
  RotateCcw,
  Save,
  Smartphone,
  Tablet,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export type EditorDevice = 'desktop' | 'tablet' | 'mobile'

export interface EditorLayoutProps {
  children: ReactNode
  sidebar: ReactNode
  onSave: () => void
  onReset: () => void
  onPreview: () => void
  previewLabel?: string
  onRefresh?: () => void
  isSaving?: boolean
  hasChanges?: boolean
  templateName?: string
  siteLabel?: string
  backHref?: Route
  device?: EditorDevice
  onDeviceChange?: (device: EditorDevice) => void
  saveError?: string | null
  lastSavedAt?: string | null
  liveMode?: boolean
  onLiveModeChange?: () => void
  previewExpanded?: boolean
  onPreviewExpandedChange?: () => void
}

const devices: Array<{
  id: EditorDevice
  label: string
  icon: typeof Monitor
  width: string
}> = [
  { id: 'desktop', label: 'Desktop', icon: Monitor, width: '100%' },
  { id: 'tablet', label: 'Tablet', icon: Tablet, width: '834px' },
  { id: 'mobile', label: 'Mobile', icon: Smartphone, width: '390px' },
]

function formatSavedAt(value: string | null | undefined) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function EditorLayout({
  children,
  sidebar,
  onSave,
  onReset,
  onPreview,
  previewLabel = 'Open site',
  onRefresh,
  isSaving = false,
  hasChanges = false,
  templateName = 'Template',
  siteLabel = 'Preview',
  backHref = '/dashboard/sites',
  device = 'desktop',
  onDeviceChange,
  saveError,
  lastSavedAt,
  liveMode = true,
  onLiveModeChange,
  previewExpanded = false,
  onPreviewExpandedChange,
}: EditorLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const savedTime = formatSavedAt(lastSavedAt)
  const activeDevice = devices.find((item) => item.id === device) || devices[0]

  useEffect(() => {
    if (!sidebarOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSidebarOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [sidebarOpen])

  const status = isSaving ? (
    <span className="inline-flex items-center gap-1.5 text-[#FDBA74]">
      <Loader2 className="h-3.5 w-3.5 animate-spin" />
      Saving…
    </span>
  ) : saveError ? (
    <span className="inline-flex items-center gap-1.5 text-red-400">
      <AlertCircle className="h-3.5 w-3.5" />
      Save failed
    </span>
  ) : hasChanges ? (
    <span className="inline-flex items-center gap-1.5 text-amber-300">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
      Unsaved changes
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 text-emerald-400">
      <Check className="h-3.5 w-3.5" />
      {savedTime ? `Saved ${savedTime}` : 'All changes saved'}
    </span>
  )

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#0F1117]">
      <header className="flex h-16 shrink-0 items-center gap-3 border-b border-white/10 bg-[#0F1117] px-3 text-[#FDFBF7] sm:px-5">
        <Link
          href={backHref}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-[#94A3B8] transition hover:bg-white/5 hover:text-[#FDFBF7]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back</span>
        </Link>

        <span className="hidden h-6 w-px bg-white/10 sm:block" />

        <Link href="/" className="hidden shrink-0 items-center gap-2 sm:flex">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-orange-50 to-orange-100 ring-1 ring-orange-200">
            <Image
              src="/logo1.png"
              alt="KOREX"
              width={28}
              height={28}
              className="h-6 w-6 object-contain"
            />
          </span>
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-sm font-semibold text-[#FDFBF7]">
              {templateName}
            </h1>
            <span className="hidden rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[#94A3B8] sm:inline">
              Visual editor
            </span>
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-[11px]">
            <span className="truncate text-[#64748B]">{siteLabel}</span>
            <span className="hidden text-[#475569] md:inline">·</span>
            <span className="hidden md:inline">{status}</span>
          </div>
        </div>

        {onLiveModeChange ? (
          <button
            type="button"
            onClick={onLiveModeChange}
            aria-pressed={liveMode}
            title={
              liveMode
                ? 'Live mode is on: changes autosave and refresh the preview'
                : 'Manual mode: press Save to update the preview'
            }
            className={cn(
              'inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-2 py-1.5 text-[11px] font-semibold transition',
              liveMode
                ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
                : 'border-white/10 text-[#94A3B8] hover:bg-white/5 hover:text-[#FDFBF7]'
            )}
          >
            <span
              className={cn(
                'h-1.5 w-1.5 rounded-full',
                liveMode
                  ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]'
                  : 'bg-slate-500'
              )}
            />
            <span className="hidden sm:inline">
              {liveMode ? 'Live' : 'Manual'}
            </span>
          </button>
        ) : null}

        <div className="hidden items-center rounded-lg border border-white/10 bg-white/[0.03] p-0.5 md:flex">
          {devices.map((item) => {
            const Icon = item.icon
            const active = item.id === device
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onDeviceChange?.(item.id)}
                aria-pressed={active}
                title={item.label}
                className={cn(
                  'grid h-8 w-9 place-items-center rounded-md transition',
                  active
                    ? 'bg-white/10 text-[#FDFBF7]'
                    : 'text-[#64748B] hover:text-[#FDFBF7]'
                )}
              >
                <Icon className="h-4 w-4" />
              </button>
            )
          })}
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {onPreviewExpandedChange ? (
            <button
              type="button"
              onClick={onPreviewExpandedChange}
              title={previewExpanded ? 'Exit full preview' : 'Expand preview panel'}
              aria-label={
                previewExpanded ? 'Exit full preview' : 'Expand preview panel'
              }
              aria-pressed={previewExpanded}
              className="hidden h-9 w-9 place-items-center rounded-lg border border-white/10 text-[#94A3B8] transition hover:bg-white/5 hover:text-[#FDFBF7] md:grid"
            >
              {previewExpanded ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </button>
          ) : null}

          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-[#94A3B8] transition hover:bg-white/5 hover:text-[#FDFBF7] lg:hidden"
            aria-label="Open design panel"
          >
            <PanelLeft className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={onReset}
            disabled={!hasChanges || isSaving}
            className="hidden items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 text-xs font-semibold text-[#94A3B8] transition hover:bg-white/5 hover:text-[#FDFBF7] disabled:cursor-not-allowed disabled:opacity-40 sm:inline-flex"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>

          <button
            type="button"
            onClick={onPreview}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 text-xs font-semibold text-[#FDFBF7] transition hover:bg-white/5"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{previewLabel}</span>
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={isSaving || !hasChanges}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow-lg shadow-orange-900/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            Save
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside
          className={cn(
            'hidden w-[340px] shrink-0 flex-col border-r border-slate-200 bg-white lg:flex',
            previewExpanded && 'lg:hidden'
          )}
        >
          {sidebar}
        </aside>

        {sidebarOpen ? (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
              aria-hidden="true"
            />
            <aside className="relative flex h-full w-[340px] max-w-[88%] flex-col bg-white shadow-2xl">
              <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 px-4">
                <p className="text-sm font-semibold text-slate-900">Design</p>
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100"
                  aria-label="Close design panel"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto">{sidebar}</div>
            </aside>
          </div>
        ) : null}

        <main className="relative flex min-w-0 flex-1 flex-col bg-[#12141C]">
          <div className="flex h-12 shrink-0 items-center gap-3 border-b border-white/10 px-4">
            <span
              className={cn(
                'inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wider',
                liveMode
                  ? 'bg-emerald-400/10 text-emerald-300'
                  : 'bg-white/5 text-[#94A3B8]'
              )}
            >
              <span
                className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  liveMode ? 'bg-emerald-400' : 'bg-slate-500'
                )}
              />
              {liveMode ? 'Live preview' : 'Preview'}
            </span>
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-md border border-white/10 bg-white/[0.03] px-3 py-1.5">
              <span className="truncate text-[11px] text-[#94A3B8]">
                {siteLabel}
              </span>
            </div>
            <span className="hidden text-[11px] text-[#64748B] sm:inline">
              {activeDevice.label} · {activeDevice.width}
            </span>
            {onRefresh ? (
              <button
                type="button"
                onClick={onRefresh}
                className="grid h-7 w-7 place-items-center rounded-md text-[#94A3B8] transition hover:bg-white/5 hover:text-[#FDFBF7]"
                aria-label="Refresh preview"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>

          <div className="flex min-h-0 flex-1 justify-center overflow-hidden bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:24px_24px] p-3 sm:p-5">
            <div
              className="h-full overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-white/10 transition-[max-width] duration-300"
              style={{ width: '100%', maxWidth: activeDevice.width }}
            >
              {children}
            </div>
          </div>
        </main>
      </div>

      <footer className="flex h-9 shrink-0 items-center justify-between border-t border-white/10 px-4 text-[11px] text-[#64748B]">
        <span className="inline-flex items-center gap-2">
          <span
            className={cn(
              'h-1.5 w-1.5 rounded-full',
              liveMode ? 'bg-emerald-400' : 'bg-amber-400'
            )}
          />
          {liveMode
            ? 'Live preview syncs after each autosave'
            : 'Manual mode — press Save to refresh the preview'}
        </span>
        <span className="hidden sm:inline">
          Changes autosave · Ctrl/⌘ + S to save now
        </span>
        <span className="capitalize">{device} view</span>
      </footer>
    </div>
  )
}
