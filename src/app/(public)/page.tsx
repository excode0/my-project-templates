import Link from 'next/link'
import { Check, Globe, Shield, Smartphone, Zap, ArrowRight, LayoutTemplate } from 'lucide-react'
import { db } from '@/lib/db'
import { TemplateCard, type TemplateCardData } from '@/components/public/TemplateCard'

export const revalidate = 60

async function getFeaturedTemplates(): Promise<TemplateCardData[]> {
  try {
    const rows = await db`
      SELECT
        t.id,
        t.name,
        t.slug,
        t.category,
        t.price,
        t.preview_image,
        t.description,
        t.is_featured,
        u.email as contributor_email,
        COALESCE((SELECT COUNT(*) FROM template_purchases WHERE template_id = t.id), 0)::int as purchase_count,
        (SELECT AVG(rating)::numeric(3,2) FROM template_reviews WHERE template_id = t.id) as avg_rating,
        COALESCE((SELECT COUNT(*) FROM template_reviews WHERE template_id = t.id), 0)::int as review_count
      FROM templates t
      JOIN users u ON t.contributor_id = u.id
      WHERE t.status = 'approved'
      ORDER BY t.is_featured DESC, t.created_at DESC
      LIMIT 6
    `
    return rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      category: row.category,
      price: Number(row.price),
      previewImage: row.preview_image,
      description: row.description,
      isFeatured: row.is_featured || false,
      purchaseCount: row.purchase_count || 0,
      avgRating: row.avg_rating ? Number(row.avg_rating) : null,
      reviewCount: row.review_count || 0,
      contributorEmail: row.contributor_email,
    }))
  } catch {
    return []
  }
}

const features = [
  {
    icon: LayoutTemplate,
    title: 'Kustomisasi Penuh',
    description: 'Sesuaikan setiap elemen visual: warna, font, spacing, dan animasi melalui 17+ jenis slot yang tersedia.',
  },
  {
    icon: Zap,
    title: 'Preview Langsung',
    description: 'Lihat perubahan secara real-time dengan auto-save. Tidak perlu rebuild atau refresh.',
  },
  {
    icon: Globe,
    title: 'Domain Kustom',
    description: 'Gunakan domain Anda sendiri atau subdomain gratis dengan verifikasi DNS dan SSL otomatis.',
  },
  {
    icon: Shield,
    title: 'Keamanan Terjamin',
    description: 'Transaksi ACID-compliant, autentikasi terlindungi, dan backup yang andal melindungi pekerjaan Anda.',
  },
  {
    icon: Smartphone,
    title: 'Responsif Di Semua Perangkat',
    description: 'Setiap template dioptimalkan untuk desktop, tablet, dan mobile secara default.',
  },
  {
    icon: Check,
    title: 'Pembelian Sekali',
    description: 'Tidak ada langganan. Beli template, miliki selamanya dengan update gratis seumur hidup.',
  },
]

const steps = [
  {
    number: '01',
    title: 'Jelajahi Marketplace',
    description: 'Jelajahi koleksi template premium kami, lihat preview langsung, dan cek harga.',
  },
  {
    number: '02',
    title: 'Beli & Kustomisasi',
    description: 'Beli template favorit Anda dan kustomisasi setiap elemen visual dengan editor yang intuitif.',
  },
  {
    number: '03',
    title: 'Launch & Berkembang',
    description: 'Hubungkan domain Anda, deploy instan, dan mulai berkembang.',
  },
]

const testimonials = [
  {
    quote: 'Korex memungkinkan kami menyelesaikan site klien dalam sehari. Editor visual benar-benar yang terbaik yang pernah saya gunakan.',
    name: 'Dewi Lestari',
    role: 'Founder, Studio Cahaya',
  },
  {
    quote: 'Perhatian terhadap tipografi dan spacing luar biasa. Konversi kami melonjak setelah beralih.',
    name: 'Arif Pratama',
    role: 'Marketing Lead, Nimbus',
  },
  {
    quote: 'Sebagai contributor, mempublikasikan template di sini sangat mulus. Proses pembayaran transparan dan cepat.',
    name: 'Sinta Maharani',
    role: 'Independent Designer',
  },
]

export default async function HomePage() {
  const featuredTemplates = await getFeaturedTemplates()

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-orange-50/30 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 lg:py-24">
        {/* Decorative Elements */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-orange-100/40 blur-3xl" />
          <div className="absolute -left-20 top-1/2 h-64 w-64 rounded-full bg-orange-50/50 blur-3xl" />
        </div>
        
        <div className="korex-section relative">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left Column */}
            <div className="relative z-10">
              <span className="korex-eyebrow">
                <Zap className="h-3.5 w-3.5" />
                Premium Professional Templates
              </span>
              
              <h1 className="mt-8 font-display text-5xl font-semibold leading-[1.1] tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
                Professional Website Templates
                <span className="mt-2 block bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600 bg-clip-text text-transparent">
                  Ready to Customize
                </span>
              </h1>
              
              <p className="mt-6 text-lg leading-relaxed text-slate-700 sm:text-xl">
                Explore our collection of professionally designed templates. Full customization, 
                one-time purchase, lifetime updates. Launch your vision in minutes, not months.
              </p>
              
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/marketplace"
                  className="korex-btn-primary group px-8 py-4"
                >
                  Explore Templates
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/pricing"
                  className="korex-btn-ghost px-8 py-4"
                >
                  View Pricing
                </Link>
              </div>
              
              {/* Stats */}
              <div className="mt-12 grid grid-cols-3 gap-6 border-t border-slate-200 pt-8">
                <div>
                  <div className="font-display text-3xl font-semibold text-slate-900 sm:text-4xl">
                    {featuredTemplates.length}
                  </div>
                  <div className="mt-1 text-sm font-medium text-slate-600">Featured Templates</div>
                </div>
                <div>
                  <div className="font-display text-3xl font-semibold text-slate-900 sm:text-4xl">17+</div>
                  <div className="mt-1 text-sm font-medium text-slate-600">Editable Slot Types</div>
                </div>
                <div>
                  <div className="font-display text-3xl font-semibold text-slate-900 sm:text-4xl">1×</div>
                  <div className="mt-1 text-sm font-medium text-slate-600">One-time Purchase</div>
                </div>
              </div>
            </div>

            {/* Right Column - Browser Mockup */}
            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-orange-200/20 via-orange-300/20 to-orange-200/20 blur-2xl" />
              <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                {/* Browser Chrome */}
                <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="flex gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-400" />
                    <div className="h-3 w-3 rounded-full bg-yellow-400" />
                    <div className="h-3 w-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 rounded-md bg-white px-3 py-1.5 text-xs text-slate-500 shadow-sm">
                    korex.studio/templates
                  </div>
                </div>
                
                {/* Browser Content */}
                <div className="space-y-5 p-8">
                  <div className="h-10 w-2/3 animate-pulse rounded-lg bg-gradient-to-r from-slate-200 to-slate-100" />
                  <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                  <div className="h-4 w-5/6 animate-pulse rounded bg-slate-100" />
                  
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="group aspect-video overflow-hidden rounded-lg bg-gradient-to-br from-orange-100 to-orange-50 shadow-sm transition-transform hover:scale-105">
                      <div className="flex h-full items-center justify-center">
                        <LayoutTemplate className="h-8 w-8 text-orange-500" />
                      </div>
                    </div>
                    <div className="group aspect-video overflow-hidden rounded-lg bg-gradient-to-br from-red-100 to-orange-50 shadow-sm transition-transform hover:scale-105">
                      <div className="flex h-full items-center justify-center">
                        <LayoutTemplate className="h-8 w-8 text-red-500" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-2">
                    <div className="h-12 w-36 animate-pulse rounded-lg bg-gradient-to-r from-orange-200 to-orange-100" />
                    <div className="h-12 flex-1 animate-pulse rounded-lg bg-slate-100" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative overflow-hidden py-20">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white via-slate-50 to-white" />
        
        <div className="korex-section relative">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <span className="korex-eyebrow">
              <Zap className="h-3.5 w-3.5" />
              Why Choose KOREX
            </span>
            <h2 className="mt-6 font-display text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              Everything You Need to Launch
            </h2>
            <p className="mt-4 text-lg text-slate-700">
              A complete platform to buy, customize, and sell premium website templates.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-orange-300 hover:shadow-xl"
              >
                {/* Hover Gradient Background */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-orange-50/0 to-orange-100/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                
                <div className="relative">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-orange-100 to-orange-50 text-orange-600 shadow-sm transition-transform duration-300 group-hover:scale-110">
                    <feature.icon className="h-7 w-7" strokeWidth={1.5} />
                  </div>
                  <h3 className="mt-6 font-display text-xl font-semibold text-slate-900">
                    {feature.title}
                  </h3>
                  <p className="mt-3 leading-relaxed text-slate-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600 py-16">
        <div className="pointer-events-none absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay" />
        <div className="korex-section relative">
          <div className="grid gap-8 text-center sm:grid-cols-3">
            <div className="group">
              <div className="font-display text-5xl font-semibold text-white transition-transform duration-300 group-hover:scale-110">
                17+
              </div>
              <div className="mt-2 text-orange-100">Editable Slot Types</div>
            </div>
            <div className="group">
              <div className="font-display text-5xl font-semibold text-white transition-transform duration-300 group-hover:scale-110">
                70%
              </div>
              <div className="mt-2 text-orange-100">Revenue for Contributors</div>
            </div>
            <div className="group">
              <div className="font-display text-5xl font-semibold text-white transition-transform duration-300 group-hover:scale-110">
                14 Days
              </div>
              <div className="mt-2 text-orange-100">Refund Window</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="korex-section">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <span className="korex-eyebrow">
              <Zap className="h-3.5 w-3.5" />
              How It Works
            </span>
            <h2 className="mt-6 font-display text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              From Idea to Live in 3 Steps
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step, idx) => (
              <div key={idx} className="relative">
                {/* Connector Line */}
                {idx < steps.length - 1 && (
                  <div className="absolute left-1/2 top-8 hidden h-px w-full bg-gradient-to-r from-orange-300 via-orange-200 to-transparent md:block" />
                )}
                
                <div className="relative text-center">
                  <div className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center">
                    {/* Outer Ring */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-200 to-orange-100 opacity-30 blur-lg" />
                    {/* Inner Circle */}
                    <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600 font-display text-2xl font-semibold text-white shadow-lg shadow-orange-500/30">
                      {step.number}
                    </div>
                  </div>
                  <h3 className="mb-3 font-display text-xl font-semibold text-slate-900">
                    {step.title}
                  </h3>
                  <p className="leading-relaxed text-slate-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Templates */}
      <section className="bg-gradient-to-b from-slate-50 to-white py-20">
        <div className="korex-section">
          <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <span className="korex-eyebrow">
                <Zap className="h-3.5 w-3.5" />
                Featured Templates
              </span>
              <h2 className="mt-6 font-display text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
                Showcase Templates
              </h2>
              <p className="mt-3 max-w-xl text-slate-600">
                Explore the most loved designs from our community, ready to customize and launch.
              </p>
            </div>
            <Link
              href="/marketplace"
              className="group inline-flex items-center gap-2 font-semibold text-orange-600 transition-colors hover:text-orange-700"
            >
              View All Templates
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {featuredTemplates.length > 0 ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {featuredTemplates.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white py-20 text-center">
              <LayoutTemplate className="mx-auto h-12 w-12 text-slate-400" />
              <p className="mt-4 text-lg text-slate-600">Templates are being prepared.</p>
              <Link href="/marketplace" className="mt-4 inline-block font-semibold text-orange-600 hover:text-orange-700">
                Open Marketplace
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="korex-section">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <span className="korex-eyebrow">
              <Zap className="h-3.5 w-3.5" />
              Testimonials
            </span>
            <h2 className="mt-6 font-display text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              Trusted by Ambitious Teams
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Testimonials from creators and businesses who have used KOREX
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="group rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-orange-200 hover:shadow-lg">
                {/* Quote Icon */}
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-100 to-orange-50 text-orange-500">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>
                
                <p className="mb-6 leading-relaxed text-slate-700 italic">
                  "{testimonial.quote}"
                </p>
                
                <div className="flex items-center gap-4 border-t border-slate-100 pt-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600 font-semibold text-white shadow-sm">
                    {testimonial.name[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">{testimonial.name}</div>
                    <div className="text-sm text-slate-600">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="korex-section">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-600 via-orange-500 to-orange-600 px-8 py-20 text-center shadow-2xl">
            {/* Decorative Elements */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
            </div>
            
            <div className="relative z-10 mx-auto max-w-3xl">
              <h2 className="font-display text-4xl font-semibold text-white sm:text-5xl">
                Ready to Get Started?
              </h2>
              <p className="mt-6 text-xl text-orange-50">
                Choose a template, customize every detail, and launch today.
              </p>
              <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
                <Link
                  href="/marketplace"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 font-semibold text-orange-600 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-orange-50 hover:shadow-xl"
                >
                  Explore Templates
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/30 bg-white/10 px-8 py-4 font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-white/50 hover:bg-white/20"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
