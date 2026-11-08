/**
 * Database Types
 * Type definitions for all database entities
 */

export type UserRole = 'user' | 'contributor' | 'admin'
export type UserStatus = 'active' | 'suspended'
export type TemplateStatus = 'draft' | 'review' | 'approved' | 'rejected'
export type TemplateType = 'editor' | 'hardcode'
export type InstanceStatus = 'active' | 'suspended'

// Database Row Types (raw from DB)
export interface UserRow {
  id: string
  username: string
  email: string
  password_hash: string
  role: UserRole
  status: UserStatus
  created_at: Date
  updated_at: Date
}

export interface TemplateRow {
  id: string
  name: string
  slug: string
  contributor_id: string
  category: string
  price: string // Decimal comes as string
  status: TemplateStatus
  type: TemplateType
  preview_image: string | null
  description: string | null
  requires_custom_domain: boolean
  is_featured: boolean
  demo_url: string | null
  manifest: any // JSONB
  created_at: Date
  updated_at: Date
}

export interface TemplateInstanceRow {
  id: string
  purchase_id: string
  user_id: string
  template_id: string
  custom_domain: string | null
  subdomain: string
  config: any // JSONB
  status: InstanceStatus
  created_at: Date
  updated_at: Date
}

export interface TemplatePurchaseRow {
  id: string
  user_id: string
  template_id: string
  price_paid: string // Decimal
  payment_status: string
  stripe_payment_intent_id: string | null
  created_at: Date
}

export interface TemplateReviewRow {
  id: string
  template_id: string
  user_id: string
  rating: number
  comment: string | null
  created_at: Date
  updated_at: Date
}

export interface DomainRow {
  id: string
  instance_id: string
  domain: string
  is_verified: boolean
  verification_token: string | null
  created_at: Date
  updated_at: Date
}

// Application Model Types (transformed for use in app)
export interface User {
  id: string
  username: string
  email: string
  role: UserRole
  status: UserStatus
  createdAt: string
  updatedAt: string
}

export interface Template {
  id: string
  name: string
  slug: string
  contributorId: string
  category: string
  price: number
  status: TemplateStatus
  type: TemplateType
  previewImage: string | null
  description: string | null
  requiresCustomDomain: boolean
  isFeatured: boolean
  demoUrl: string | null
  manifest: any
  createdAt: string
  updatedAt: string
}

export interface TemplateWithStats extends Template {
  contributorUsername: string
  contributorEmail: string
  purchaseCount: number
  avgRating: number | null
  reviewCount: number
}

export interface TemplateInstance {
  id: string
  purchaseId: string
  userId: string
  templateId: string
  customDomain: string | null
  subdomain: string
  config: any
  status: InstanceStatus
  createdAt: string
  updatedAt: string
}

export interface TemplatePurchase {
  id: string
  userId: string
  templateId: string
  pricePaid: number
  paymentStatus: string
  stripePaymentIntentId: string | null
  createdAt: string
}

export interface TemplateReview {
  id: string
  templateId: string
  userId: string
  username: string
  email: string
  rating: number
  comment: string | null
  createdAt: string
  updatedAt: string
}

export interface Domain {
  id: string
  instanceId: string
  domain: string
  isVerified: boolean
  verificationToken: string | null
  createdAt: string
  updatedAt: string
}

// Query Filter Types
export interface TemplateFilters {
  category?: string
  status?: TemplateStatus
  contributorId?: string
  minPrice?: number
  maxPrice?: number
  featured?: boolean
  search?: string
}

export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResult<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
