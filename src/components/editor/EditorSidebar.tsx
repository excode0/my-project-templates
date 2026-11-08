'use client'

import { useMemo, useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  LayoutGrid,
  Palette,
  Search,
  Settings2,
  Sparkles,
  SquarePen,
  Type,
  type LucideIcon,
} from 'lucide-react'
import { type EditableSlot } from '@/types'
import { SlotEditor } from './slots/SlotEditor'
import { cn } from '@/lib/utils'

export interface EditorSidebarProps {
  slots: EditableSlot[]
  values: Record<string, any>
  onChange: (slotId: string, value: any) => void
  disabled?: boolean
}

type SlotCategory =
  | 'content'
  | 'visual'
  | 'style'
  | 'layout'
  | 'effects'
  | 'settings'

const categoryConfig: Record<
  SlotCategory,
  { label: string; icon: LucideIcon }
> = {
  content: { label: 'Content', icon: Type },
  visual: { label: 'Images & media', icon: SquarePen },
  style: { label: 'Colors & style', icon: Palette },
  layout: { label: 'Layout', icon: LayoutGrid },
  effects: { label: 'Effects', icon: Sparkles },
  settings: { label: 'Settings', icon: Settings2 },
}

const categoryOrder: SlotCategory[] = [
  'content',
  'visual',
  'style',
  'layout',
  'effects',
  'settings',
]

const typeLabels: Record<string, string> = {
  text: 'Text',
  richtext: 'Rich text',
  image: 'Image',
  color: 'Color',
  gradient: 'Gradient',
  variant: 'Variant',
  font: 'Font',
  spacing: 'Spacing',
  number: 'Number',
  toggle: 'Toggle',
  shadow: 'Shadow',
  select: 'Select',
  multiselect: 'Multi-select',
  animation: 'Animation',
  link: 'Link',
  array: 'List',
  object: 'Group',
}

export function EditorSidebar({
  slots,
  values,
  onChange,
  disabled,
}: EditorSidebarProps) {
  const [query, setQuery] = useState('')
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

  const filteredSlots = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return slots
    return slots.filter((slot) =>
      [slot.id, slot.label, slot.type, slot.category]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    )
  }, [slots, query])

  const grouped = useMemo(() => {
    const groups = new Map<SlotCategory, EditableSlot[]>()

    for (const slot of filteredSlots) {
      const category = (slot.category || 'settings') as SlotCategory
      const list = groups.get(category) || []
      list.push(slot)
      groups.set(category, list)
    }

    return categoryOrder
      .filter((category) => groups.has(category))
      .map((category) => ({
        category,
        ...categoryConfig[category],
        slots: groups.get(category)!,
      }))
  }, [filteredSlots])

  const searching = query.trim().length > 0

  const toggle = (category: string) => {
    setCollapsed((current) => {
      const next = new Set(current)
      if (next.has(category)) next.delete(category)
      else next.add(category)
      return next
    })
  }

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 space-y-3 border-b border-slate-200 p-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Design panel</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            {slots.length} editable field{slots.length === 1 ? '' : 's'}
          </p>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search fields"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {grouped.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="text-sm font-medium text-slate-900">
              No fields found
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Try a different search term.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {grouped.map((group) => {
              const Icon = group.icon
              const isCollapsed = !searching && collapsed.has(group.category)

              return (
                <section key={group.category}>
                  <button
                    type="button"
                    onClick={() => toggle(group.category)}
                    aria-expanded={!isCollapsed}
                    className="flex w-full items-center gap-2.5 px-4 py-3 text-left transition hover:bg-slate-50"
                  >
                    <span className="grid h-7 w-7 place-items-center rounded-lg bg-slate-100 text-slate-500">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="flex-1 text-xs font-semibold uppercase tracking-[0.1em] text-slate-600">
                      {group.label}
                    </span>
                    <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                      {group.slots.length}
                    </span>
                    {isCollapsed ? (
                      <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                    )}
                  </button>

                  {isCollapsed ? null : (
                    <div className="space-y-5 px-4 pb-5">
                      {group.slots.map((slot) => (
                        <div key={slot.id} className="group">
                          <div className="mb-2 flex items-center justify-between gap-2">
                            <span className="font-mono text-[10px] text-slate-400">
                              {slot.id}
                            </span>
                            <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                              {typeLabels[slot.type] || slot.type}
                            </span>
                          </div>
                          <div
                            className={cn(
                              'rounded-xl border border-slate-100 bg-slate-50/40 p-3 transition group-focus-within:border-orange-200 group-focus-within:bg-white',
                              disabled && 'opacity-70'
                            )}
                          >
                            <SlotEditor
                              slot={slot}
                              value={values[slot.id]}
                              onChange={(value) => onChange(slot.id, value)}
                              disabled={disabled}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
