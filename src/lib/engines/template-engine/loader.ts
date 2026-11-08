import type { TemplateManifest } from '@/types'
import type { LoadedTemplate, TemplateLoader } from './types'

/**
 * Template Loader
 * Loads templates dynamically from src/templates/{slug}/ folder
 * Server-side only (does not use fs in client components)
 */
export class TemplateLoaderImpl implements TemplateLoader {
  private cache = new Map<string, LoadedTemplate>()

  /**
   * Load template with manifest and components
   */
  async loadTemplate(slug: string): Promise<LoadedTemplate> {
    // Check cache first
    if (this.cache.has(slug)) {
      return this.cache.get(slug)!
    }

    // Load manifest (falls back to the generic manifest)
    const manifest = await this.getManifest(slug)

    try {
      // Dynamic import template components
      // In Next.js, dynamic imports work at runtime
      const [templateModule, layoutModule] = await Promise.all([
        import(`@/templates/${slug}/page`),
        import(`@/templates/${slug}/layout`),
      ])

      const loaded: LoadedTemplate = {
        manifest,
        Component: templateModule.default,
        Layout: layoutModule.default,
      }

      // Cache the loaded template
      this.cache.set(slug, loaded)

      return loaded
    } catch (error) {
      // Template folder does not exist yet: render the universal generic template
      try {
        const [genericPage, genericLayout] = await Promise.all([
          import('@/templates/generic/page'),
          import('@/templates/generic/layout'),
        ])

        const loaded: LoadedTemplate = {
          manifest,
          Component: genericPage.default,
          Layout: genericLayout.default,
        }

        this.cache.set(slug, loaded)
        return loaded
      } catch {
        throw new Error(`Failed to load template "${slug}": ${error}`)
      }
    }
  }

  /**
   * Get template manifest.json
   */
  async getManifest(slug: string): Promise<TemplateManifest> {
    try {
      // In production build, use dynamic import for JSON
      const manifestModule = await import(`@/templates/${slug}/manifest.json`)
      return manifestModule.default as TemplateManifest
    } catch (error) {
      // Fall back to the universal manifest so every template remains editable
      try {
        const genericModule = await import('@/templates/generic/manifest.json')
        const generic = genericModule.default as unknown as TemplateManifest
        return {
          ...generic,
          id: slug,
        }
      } catch {
        throw new Error(`Failed to load manifest for "${slug}": ${error}`)
      }
    }
  }

  /**
   * Validate manifest structure
   */
  validateManifest(manifest: TemplateManifest): boolean {
    const required = ['id', 'name', 'version', 'category', 'capabilities']
    
    for (const field of required) {
      if (!(field in manifest)) {
        console.error(`Missing required field: ${field}`)
        return false
      }
    }

    // Validate capabilities
    if (!manifest.capabilities.editableSlots || !Array.isArray(manifest.capabilities.editableSlots)) {
      console.error('Missing or invalid editableSlots')
      return false
    }

    // Validate each slot has required fields
    for (const slot of manifest.capabilities.editableSlots) {
      if (!slot.id || !slot.label || !slot.type) {
        console.error('Invalid slot configuration:', slot)
        return false
      }
    }

    return true
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear()
  }
}

// Singleton instance
export const templateLoader = new TemplateLoaderImpl()

/**
 * Server-side function to load template
 */
export async function loadTemplate(slug: string): Promise<LoadedTemplate> {
  return templateLoader.loadTemplate(slug)
}

/**
 * Get template manifest only
 */
export async function getTemplateManifest(slug: string): Promise<TemplateManifest> {
  return templateLoader.getManifest(slug)
}
