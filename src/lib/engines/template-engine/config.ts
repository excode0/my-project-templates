import type { TemplateConfig } from '@/types'

/**
 * Normalize a stored config value into a TemplateConfig object.
 * postgres.js may return JSONB columns as strings when they were
 * double-encoded, so handle both objects and JSON strings.
 */
export function normalizeTemplateConfig(value: unknown): TemplateConfig {
  let parsed: any = value

  if (typeof parsed === 'string') {
    try {
      parsed = JSON.parse(parsed)
    } catch {
      parsed = {}
    }
  }

  if (!parsed || typeof parsed !== 'object') {
    parsed = {}
  }

  const config: TemplateConfig = {
    slots:
      parsed.slots && typeof parsed.slots === 'object' ? parsed.slots : {},
    pages: Array.isArray(parsed.pages) ? parsed.pages : [],
  }

  if (parsed.theme && typeof parsed.theme === 'object') {
    config.theme = parsed.theme
  }

  return config
}

/**
 * Build a config populated with the manifest's default slot values.
 */
export function buildDefaultConfig(manifest: any): TemplateConfig {
  const slots: Record<string, unknown> = {}
  const editableSlots =
    manifest?.capabilities?.editableSlots ?? manifest?.editableSlots ?? []

  for (const slot of editableSlots) {
    if (typeof slot?.id === 'string' && slot.default !== undefined) {
      slots[slot.id] = slot.default
    }
  }

  return { slots, pages: [] }
}

/**
 * Merge a saved config over a base config. Saved values win, but slots added
 * to the manifest after the config was stored keep their defaults.
 */
export function mergeConfig(
  base: TemplateConfig,
  saved: unknown
): TemplateConfig {
  const normalized = normalizeTemplateConfig(saved)

  return {
    ...base,
    ...normalized,
    slots: { ...base.slots, ...normalized.slots },
    pages: normalized.pages.length > 0 ? normalized.pages : base.pages,
  }
}

/**
 * Merge saved config over manifest defaults so newly added slots still appear.
 */
export function mergeTemplateConfig(
  manifest: any,
  saved: unknown
): TemplateConfig {
  return mergeConfig(buildDefaultConfig(manifest), saved)
}
