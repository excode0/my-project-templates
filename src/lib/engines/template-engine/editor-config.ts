import type { TemplateConfig, TemplateManifest } from '@/types'
import { buildDefaultConfig, mergeConfig } from './config'

export interface ResolvedManifest {
  manifest: TemplateManifest & Record<string, any>
  renderSlug: string
  isGeneric: boolean
}

export interface TemplateMeta {
  name?: string | null
  description?: string | null
  features?: unknown
}

/**
 * Load a template manifest, falling back to the universal template when the
 * slug has no hardcoded folder. The fallback keeps the template's own name so
 * the editor header and preview stay meaningful.
 */
export async function resolveTemplateManifest(
  slug: string,
  meta: TemplateMeta = {}
): Promise<ResolvedManifest> {
  try {
    const manifestModule = await import(`@/templates/${slug}/manifest.json`)
    return {
      manifest: manifestModule.default,
      renderSlug: slug,
      isGeneric: false,
    }
  } catch {
    const genericModule = await import('@/templates/generic/manifest.json')
    const generic = genericModule.default as unknown as TemplateManifest &
      Record<string, any>

    return {
      manifest: {
        ...generic,
        id: slug,
        name: meta.name || generic.name,
        description: meta.description || generic.description,
      },
      renderSlug: 'generic',
      isGeneric: true,
    }
  }
}

/**
 * Build the editor config for a template: manifest defaults, then metadata for
 * generic templates, then the values saved by the super admin.
 */
export function buildEditorConfig(
  resolved: ResolvedManifest,
  saved: unknown,
  meta: TemplateMeta = {}
): TemplateConfig {
  const base = buildDefaultConfig(resolved.manifest)

  if (resolved.isGeneric) {
    base.slots['content.eyebrow'] = String(meta.name || 'TEMPLATE').toUpperCase()
    base.slots['content.title'] = meta.name || resolved.manifest.name
    base.slots['content.subtitle'] = meta.description || ''
    base.slots['content.description'] = meta.description || ''
    if (Array.isArray(meta.features)) {
      base.slots['content.features'] = meta.features
    }
  }

  return mergeConfig(base, saved)
}
