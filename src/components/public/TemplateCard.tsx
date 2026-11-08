'use client'

import Image from 'next/image'
import Link from 'next/link'
import {
  Briefcase,
  Building2,
  Eye,
  GraduationCap,
  LayoutTemplate,
  Palette,
  PenLine,
  Rocket,
  ShoppingCart,
  Sparkles,
  Star,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface TemplateCardData {
  id: string
  name: string
  slug: string
  category: string
  price: number
  previewImage: string | null
  description: string | null
  isFeatured?: boolean
  purchaseCount?: number
  avgRating?: number | null
  reviewCount?: number
  contributorEmail?: string
  contributorUsername?: string | null
}

const categoryIcons: Record<string, LucideIcon> = {
  business: Briefcase,
  education: GraduationCap,
  portfolio: Palette,
  ecommerce: ShoppingCart,
  blog: PenLine,
  landing: Rocket,
  corporate: Building2,
  creative: Sparkles,
  wedding: Sparkles,
}

export function formatPrice(price: number) {
  if (price === 0) return 'Free'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

export function Rating({ rating, reviewCount }: { rating?: number | null; reviewCount?: number }) {
  if (!rating) {
    return <span className="text-xs text-slate-400">No reviews</span>
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-slate-600">
      <Star className="h-3.5 w-3.5 fill-orange-500 text-orange-500" />
      <span className="font-semibold text-slate-900">{rating.toFixed(1)}</span>
      {typeof reviewCount === 'number' && reviewCount > 0 && <span>({reviewCount})</span>}
    </span>
  )
}

function ArrowUpRight(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" /></svg>
}

export function TemplateCard({ template }: { template: TemplateCardData }) {
  const Icon = categoryIcons[template.category.toLowerCase()] ?? LayoutTemplate
  const contributor =
    template.contributorUsername || template.contributorEmail || 'KOREX Studio'

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-orange-300 hover:shadow-xl">
      {/* Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
        {template.previewImage ? (
          <Image
            src={template.previewImage}
            alt={template.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
            <Icon className="h-16 w-16 text-orange-400" strokeWidth={1.2} />
          </div>
        )}

        {/* Badges */}
        <div className="absolute left-4 top-4 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-700 shadow-sm backdrop-blur">
            <Icon className="h-3.5 w-3.5 text-orange-500" />
            {template.category}
          </span>
          {template.isFeatured && (
            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white shadow-sm">
              <Star className="h-3 w-3 fill-white" />
              Featured
            </span>
          )}
        </div>

        {/* Hover Overlay with Preview Button */}
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/60 via-black/30 to-transparent opacity-0 transition-all duration-300 group-hover:opacity-100">
          <div className="flex flex-col items-center gap-3 translate-y-4 transition-transform duration-300 group-hover:translate-y-0">
            <Link
              href={`/demo/${template.slug}`}
              onClick={(e) => e.stopPropagation()}
              target='_blank'
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-slate-900 shadow-lg transition-all hover:scale-105"
            >
              <Eye className="h-4 w-4" />
              Live Preview
            </Link>
            <Link
              href={`/marketplace/${template.slug}`}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-white bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
            >
              View Details
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <Link href={`/marketplace/${template.slug}`} className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-lg font-semibold text-slate-900 transition-colors group-hover:text-orange-600">
            {template.name}
          </h3>
          <Rating rating={template.avgRating} reviewCount={template.reviewCount} />
        </div>

        <p className="mt-2 line-clamp-2 min-h-[2.5rem] text-sm leading-relaxed text-slate-600">
          {template.description || 'Fully customizable professional template.'}
        </p>

        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
          <div>
            <div className="font-display text-lg font-semibold text-orange-600">
              {formatPrice(template.price)}
            </div>
            <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
              <Users className="h-3 w-3" />
              {template.purchaseCount ?? 0} sold
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-[11px] font-semibold text-white shadow-sm">
              {contributor[0]?.toUpperCase()}
            </div>
            <span className="max-w-[90px] truncate font-medium">{contributor}</span>
          </div>
        </div>
      </Link>
    </div>
  )
}
