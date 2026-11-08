// Core Types for Template Marketplace System

export type UserRole = 'user' | 'contributor' | 'admin' | 'super_admin'
export type TemplateStatus =
  | 'draft'
  | 'review'
  | 'pending'
  | 'published'
  | 'approved'
  | 'rejected'
export type PurchaseStatus = 'pending' | 'active' | 'suspended'
export type DomainStatus = 'pending' | 'verified' | 'failed'

// User
export interface User {
  id: string
  email: string
  password_hash: string
  role: UserRole
  status: 'active' | 'suspended'
  created_at: Date
  updated_at: Date
}

// Template
export interface Template {
  id: string
  name: string
  slug: string
  contributor_id: string
  category: string
  price: number
  status: TemplateStatus
  type: 'editor' | 'hardcode'
  preview_image: string
  description: string
  requires_custom_domain: boolean
  config?: TemplateConfig
  created_at: Date
  updated_at: Date
}

// Template Purchase
export interface TemplatePurchase {
  id: string
  user_id: string
  template_id: string
  domain: string | null
  domain_price: number
  template_price: number
  total_price: number
  status: PurchaseStatus
  purchased_at: Date
}

// Template Instance (deployed template)
export interface TemplateInstance {
  id: string
  purchase_id: string
  user_id: string
  template_id: string
  custom_domain: string | null
  subdomain: string
  config: TemplateConfig
  status: 'active' | 'suspended'
  created_at: Date
  updated_at: Date
}

// Template Page
export interface TemplatePage {
  id: string
  template_id: string
  slug: string
  name: string
  is_dynamic: boolean
  is_default: boolean
  page_schema: Record<string, any>
  created_by: string
  created_at: Date
}

// Domain
export interface Domain {
  id: string
  user_id: string
  domain: string
  status: DomainStatus
  dns_records: Record<string, any>
  verified_at: Date | null
  expires_at: Date | null
}

// Slot Types for Editor
export type SlotType =
  | 'text'
  | 'richtext'
  | 'image'
  | 'color'
  | 'gradient'
  | 'variant'
  | 'font'
  | 'spacing'
  | 'number'
  | 'toggle'
  | 'shadow'
  | 'select'
  | 'multiselect'
  | 'animation'
  | 'link'
  | 'array'
  | 'object'

// Editable Slot Definition
export interface EditableSlot {
  id: string
  label: string
  type: SlotType
  category?: 'content' | 'visual' | 'style' | 'layout' | 'effects' | 'settings'
  default?: any
  options?: Array<{ value: any; label: string; preview?: string }>
  validation?: {
    required?: boolean
    min?: number
    max?: number
    pattern?: string
    errorMessage?: string
    maxItems?: number
    minItems?: number
    itemSchema?: Record<string, any>
  }
  visibleWhen?: Record<string, any>
  // Type-specific props
  maxLength?: number
  aspectRatio?: string
  maxSizeMB?: number
  unit?: string
  min?: number
  max?: number
  step?: number
  allowedFormats?: string[]
  presets?: any[]
  fields?: Record<string, any>
}

// Template Manifest (manifest.json structure)
export interface TemplateManifest {
  id: string
  name: string
  version: string
  category: string
  price: number
  requiresCustomDomain: boolean
  contributor: {
    id: string
    name: string
  }
  capabilities: {
    maxPages: number
    allowDynamicPages: boolean
    allowedPageTypes: string[]
    editableSlots: EditableSlot[]
  }
  editorConfig: {
    allowedComponents: string[]
  }
  defaultPages: Array<{
    slug: string
    name: string
    isDynamic: boolean
  }>
  mockData?: Record<string, any>
}

// Template Config (stored in template_instances.config)
export interface TemplateConfig {
  slots: Record<string, any>
  pages: Array<{
    slug: string
    enabled: boolean
    config: Record<string, any>
  }>
  theme?: {
    primaryColor?: string
    fontFamily?: string
  }
}

// Template Loader Response
export interface LoadedTemplate {
  manifest: TemplateManifest
  Component: React.ComponentType<any>
  Layout: React.ComponentType<any>
}
