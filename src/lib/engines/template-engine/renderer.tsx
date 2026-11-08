import { loadTemplate } from './loader'
import { TemplateProvider } from './context'
import type { TemplateConfig } from '@/types'

export interface TemplateRendererProps {
  templateSlug: string
  instanceId: string
  config: TemplateConfig
  isPreview?: boolean
  onSlotUpdate?: (slotId: string, value: any) => void
}

/**
 * Server Component: Template Renderer
 * Dynamically loads and renders a template with config
 */
export async function TemplateRenderer({
  templateSlug,
  instanceId,
  config,
  isPreview = false,
  onSlotUpdate,
}: TemplateRendererProps) {
  try {
    // Load template
    const { Component, Layout, manifest } = await loadTemplate(templateSlug)

    // Validate manifest
    if (!manifest || !manifest.id) {
      throw new Error('Invalid template manifest')
    }

    return (
      <TemplateProvider
        config={config}
        manifest={manifest}
        instanceId={instanceId}
        isPreview={isPreview}
        onSlotUpdate={onSlotUpdate}
      >
        <Layout config={config} manifest={manifest}>
          <Component config={config} instanceId={instanceId} isPreview={isPreview} />
        </Layout>
      </TemplateProvider>
    )
  } catch (error) {
    console.error('Template render error:', error)
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-red-600">Template Error</h1>
          <p className="text-muted-foreground">
            Failed to load template "{templateSlug}"
          </p>
          <pre className="text-sm bg-muted p-4 rounded text-left max-w-2xl overflow-auto">
            {error instanceof Error ? error.message : String(error)}
          </pre>
        </div>
      </div>
    )
  }
}
