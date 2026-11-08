import Link from 'next/link'
import { ArrowRight, Check, Globe, CreditCard } from 'lucide-react'
import { PageHeader } from '@/components/public/PageHeader'

export const metadata = {
  title: 'Harga - Korex Template Marketplace',
  description: 'Transparan, terjangkau. Beli template sekali, miliki selamanya. Mulai dari Rp199K.',
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <PageHeader
        eyebrow="Pricing"
        title={
          <>
            Harga yang <span className="text-gradient-fire">Adil</span>, Transparan
          </>
        }
        description="Beli template sekali, milik Anda selamanya. Tidak ada langganan bulanan, tidak ada biaya tersembunyi."
      >
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
          Dari <span className="text-orange-600">Rp199.000</span> saja
        </p>
      </PageHeader>

      {/* Pricing Structure */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="korex-h2 mb-12 text-center">
            Paket & Harga
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Option A: Subdomain Gratis */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:border-orange-300 hover:shadow-lg">
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-semibold mb-4">
                  <Globe className="w-4 h-4" />
                  Subdomain Gratis
                </div>
                <h3 className="font-display text-2xl font-semibold text-slate-900">Mulai dengan Subdomain</h3>
                <p className="text-slate-600 mt-2">Sempurna untuk brand personal atau awal membangun</p>
              </div>

              <div className="mb-6">
                <div className="flex items-end gap-2 mb-2">
                  <span className="font-display text-4xl font-semibold text-slate-900">Rp199K</span>
                  <span className="text-slate-500 text-sm">- Rp299K</span>
                </div>
                <p className="text-slate-600 text-sm">tergantung template yang dipilih</p>
              </div>

              <div className="space-y-4 mb-8">
                <h4 className="font-semibold text-slate-900">Included:</h4>
                <ul className="space-y-3">
                  {[
                    '✓ 1 Template Premium Pilihan',
                    '✓ Subdomain gratis (namaanda.korex.studio)',
                    '✓ Kustomisasi penuh (17+ slot)',
                    '✓ Update gratis selamanya',
                    '✓ SSL Certificate gratis',
                    '✓ Dukungan email 1 hari kerja',
                    '✓ Akses seumur hidup (tanpa biaya renewal)',
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-slate-700">
                      <span className="mt-0.5 font-semibold text-orange-600">✓</span>
                      <span>{item.substring(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href="/marketplace"
                className="korex-btn-ghost w-full"
              >
                Lihat Template
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Option B: Custom Domain */}
            <div className="relative rounded-2xl border border-orange-300 bg-orange-50/60 p-8 shadow-sm">
              <div className="absolute -top-4 right-6 rounded-full bg-orange-600 px-4 py-1 text-sm font-semibold text-white shadow-sm">
                POPULER
              </div>

              <div className="mb-6">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-3 py-1 text-sm font-semibold text-orange-700">
                  <CreditCard className="w-4 h-4" />
                  Upgrade ke Domain Sendiri
                </div>
                <h3 className="font-display text-2xl font-semibold text-slate-900">Lebih Professional dengan Domain Sendiri</h3>
                <p className="text-slate-600 mt-2">Gunakan domain Anda sendiri untuk kesan profesional</p>
              </div>

              <div className="mb-6 rounded-xl border border-orange-100 bg-white p-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-slate-600 text-sm font-semibold">Template</p>
                    <div className="flex items-end gap-2">
                      <span className="font-display text-3xl font-semibold text-slate-900">Rp199K</span>
                      <span className="text-slate-500 text-sm">- Rp299K</span>
                    </div>
                  </div>
                  
                  <div className="border-t border-slate-200 pt-3">
                    <p className="text-slate-600 text-sm font-semibold">+ Domain Custom</p>
                    <div className="flex items-end gap-2">
                      <span className="font-display text-3xl font-semibold text-slate-900">Rp100K</span>
                      <span className="text-slate-500 text-sm">- Rp200K / tahun</span>
                    </div>
                  </div>

                  <div className="-mx-4 -mb-4 rounded-b-xl border-t border-orange-200 bg-orange-100 px-4 py-3 pt-3">
                    <p className="text-slate-600 text-xs font-semibold uppercase tracking-wider">Total Investasi</p>
                    <div className="flex items-end gap-2">
                      <span className="font-display text-4xl font-semibold text-orange-600">Rp299K</span>
                      <span className="text-slate-600 text-sm">- Rp499K</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-600">Domain diperpanjang tahunan.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <h4 className="font-semibold text-slate-900">Included:</h4>
                <ul className="space-y-3">
                  {[
                    '✓ Semua dari Paket Subdomain',
                    '✓ Domain custom (milik Anda sendiri)',
                    '✓ Email notifications',
                    '✓ Setup & konfigurasi DNS',
                    '✓ Priority support (email + chat)',
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-slate-700">
                      <span className="mt-0.5 font-semibold text-orange-600">✓</span>
                      <span>{item.substring(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href="/marketplace"
                className="korex-btn-primary w-full"
              >
                Mulai Sekarang
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Template Pricing */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="korex-h2 mb-4 text-center">
            Harga Template Kami
          </h2>
          <p className="text-center text-slate-600 mb-12 max-w-2xl mx-auto">
            Setiap template adalah investasi satu kali. Tidak ada biaya bulanan. Pembaruan gratis selamanya.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[
              {
                name: 'Wedding Elegant',
                price: 'Rp299.000',
                desc: 'Template pernikahan dengan galeri foto, countdown, timeline cerita',
                features: ['Responsive Design', 'Photo Gallery', 'RSVP Form', 'Timeline Cerita'],
              },
              {
                name: 'Portfolio Creative',
                price: 'Rp199.000',
                desc: 'Showcase karya dengan gaya modern untuk designer & fotografer',
                features: ['Project Showcase', 'Skills Section', 'Contact Form', 'Testimonials'],
              },
              {
                name: 'Template Custom',
                price: 'Custom',
                desc: 'Butuh sesuatu yang unik? Hubungi tim kami untuk solusi custom',
                features: ['Design Custom', 'Unlimited Features', 'Priority Support', 'Dedicated Manager'],
              },
            ].map((template, idx) => (
              <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-lg">
                <h3 className="mb-2 font-display text-lg font-semibold text-slate-900">{template.name}</h3>
                <div className="mb-2 font-display text-2xl font-semibold text-orange-600">{template.price}</div>
                <p className="text-sm text-slate-600 mb-4">{template.desc}</p>
                <ul className="space-y-2 mb-4">
                  {template.features.map((feat, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                      <Check className="h-4 w-4 text-orange-600" />
                      {feat}
                    </li>
                  ))}
                </ul>
                <Link
                  href={template.price === 'Custom' ? '/contact' : '/marketplace'}
                  className="text-orange-600 font-semibold text-sm hover:underline inline-flex items-center gap-1"
                >
                  {template.price === 'Custom' ? 'Hubungi kami' : 'Lihat demo'}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Domain Pricing */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="korex-h2 mb-12 text-center">
            Harga Domain (Opsional)
          </h2>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-slate-900">Domain</th>
                    <th className="px-6 py-4 text-left font-semibold text-slate-900">Harga/Tahun</th>
                    <th className="px-6 py-4 text-left font-semibold text-slate-900">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {[
                    {
                      domain: '.com, .net, .org',
                      price: 'Rp150.000',
                      desc: 'Domain internasional populer',
                    },
                    {
                      domain: '.id, .co.id, .ac.id',
                      price: 'Rp200.000',
                      desc: 'Domain lokal Indonesia',
                    },
                    {
                      domain: 'TLD Lainnya',
                      price: 'Rp100.000',
                      desc: 'Domain khusus lainnya (rata-rata)',
                    },
                    {
                      domain: 'Subdomain Korex (gratis)',
                      price: 'Gratis',
                      desc: 'namaanda.korex.studio (tanpa biaya)',
                    },
                  ].map((row, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="px-6 py-4 font-semibold text-slate-900">{row.domain}</td>
                      <td className="px-6 py-4 font-display text-lg font-semibold text-orange-600">{row.price}</td>
                      <td className="px-6 py-4 text-slate-600">{row.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-slate-200 bg-orange-50/60 px-6 py-4">
              <p className="text-sm text-slate-600">
                <span className="font-semibold text-slate-900">Catatan:</span> Template dibayar sekali. Harga domain adalah biaya renewal tahunan dan diperpanjang setiap tahun.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="korex-h2 mb-12 text-center">
            Pertanyaan Umum
          </h2>

          <div className="space-y-6">
            {[
              {
                q: 'Apakah ada biaya berlangganan bulanan?',
                a: 'Tidak. Semua template adalah pembelian satu kali selamanya. Tidak ada biaya berlangganan, tidak ada biaya pembaruan. Setelah membeli, Anda memiliki akses selamanya.',
              },
              {
                q: 'Bisa pakai template untuk klien saya?',
                a: 'Tentu saja! Semua template kami termasuk hak komersial. Anda dapat menggunakannya untuk proyek pribadi, bisnis sendiri, atau proyek klien. Tidak ada pembatasan penggunaan.',
              },
              {
                q: 'Apakah custom domain itu wajib?',
                a: 'Tidak. Anda bisa langsung mulai dengan subdomain gratis (misal: namaanda.korex.studio). Custom domain adalah opsi jika Anda ingin domain yang lebih profesional.',
              },
              {
                q: 'Bagaimana kalau saya ingin beli lebih dari 1 template?',
                a: 'Anda bisa membeli template sebanyak yang Anda mau. Setiap pembelian adalah transaksi terpisah. Jadi Anda bisa punya 1, 5, atau 10 template - semua tetap milik Anda selamanya.',
              },
              {
                q: 'Bagaimana dengan update template?',
                a: 'Semua template mendapat update gratis selamanya. Kami terus memperbaiki, menambah fitur baru, dan meningkatkan keamanan. Semua update diterapkan otomatis tanpa biaya tambahan.',
              },
              {
                q: 'Ada garansi kepuasan?',
                a: 'Ya! Kami menawarkan garansi uang kembali 14 hari jika Anda tidak puas. Jika ada alasan apa pun, hubungi kami dan kami refund 100% tanpa pertanyaan.',
              },
            ].map((item, idx) => (
              <details key={idx} className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-colors hover:border-orange-300">
                <summary className="font-semibold text-slate-900 flex justify-between items-center">
                  {item.q}
                  <span className="text-orange-600 group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </summary>
                <p className="text-slate-600 mt-4 leading-relaxed">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="korex-section">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-600 via-orange-500 to-orange-600 px-8 py-16 text-center shadow-2xl">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
            </div>
            <div className="relative z-10 mx-auto max-w-3xl">
              <h2 className="font-display text-3xl font-semibold text-white sm:text-4xl">
                Siap Mulai Membangun?
              </h2>
              <p className="mt-4 text-lg text-orange-50">
                Jangan butuh kartu kredit untuk explore. Lihat template kami sekarang dan mulai dalam hitungan menit.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
                <Link
                  href="/marketplace"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 font-semibold text-orange-600 shadow-lg transition-all hover:-translate-y-0.5 hover:bg-orange-50"
                >
                  Jelajahi Template
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/30 bg-white/10 px-8 py-4 font-semibold text-white backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white/20"
                >
                  Tanya Kami
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
