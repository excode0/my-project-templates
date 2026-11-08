import type { TemplateManifest, TemplateConfig, EditableSlot } from '@/types'

export interface TemplateEngineConfig {
  templatesDir: string
  cacheEnabled: boolean
  cacheTTL: number
}

export interface TemplateLoader {
  loadTemplate(slug: string): Promise<LoadedTemplate>
  getManifest(slug: string): Promise<TemplateManifest>
  validateManifest(manifest: TemplateManifest): boolean
}

export interface LoadedTemplate {
  manifest: TemplateManifest
  Component: React.ComponentType<TemplateRenderProps>
  Layout: React.ComponentType<TemplateLayoutProps>
}

export interface TemplateRenderProps {
  config: TemplateConfig
  instanceId: string
  isPreview?: boolean
}

export interface TemplateLayoutProps {
  children: React.ReactNode
  config: TemplateConfig
  manifest: TemplateManifest
}

export interface TemplateCache {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T, ttl?: number): Promise<void>
  delete(key: string): Promise<void>
  clear(): Promise<void>
}

export interface SlotValue {
  slotId: string
  value: any
  lastModified: Date
}

export interface TemplateValidationError {
  field: string
  message: string
  code: string
}

export interface TemplateValidationResult {
  valid: boolean
  errors: TemplateValidationError[]
}
