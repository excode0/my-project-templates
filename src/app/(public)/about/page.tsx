import Link from 'next/link'
import {
  ArrowRight,
  Check,
  Compass,
  Globe,
  HeartHandshake,
  LayoutGrid,
  Palette,
  Sparkles,
  Type,
} from 'lucide-react'
import { PageHeader } from '@/components/public/PageHeader'

export const metadata = {
  title: 'Tentang Kami',
  description: 'Pelajari misi, nilai, dan tim di balik marketplace template Korex.',
}

const values = [
  {
    icon: Globe,
    title: 'Kualitas di Atas Kuantitas',
    description:
      'Setiap template direview oleh tim kami sebelum sampai ke marketplace. Tidak ada isinya, hanya karya yang kami banggakan.',
  },
  {
    icon: HeartHandshake,
    title: 'Creator Pertama',
    description:
      'Contributor mendapat 70% dari setiap penjualan dan pembayaran transparan. Saat Anda menang, kami menang.',
  },
  {
    icon: Compass,
    title: 'Dibuat untuk Kustomisasi',
    description:
      'Kontrol visual penuh adalah prinsip inti. Setiap warna, font, layout, dan animasi adalah milik Anda untuk dibentuk.',
  },
  {
    icon: Check,
    title: 'Dibangun untuk Orang',
    description:
      'Kami menghargai detail dari tipografi dan spacing hingga motion, agar setiap template terasa premium sejak pertama kali dibuka.',
  },
]

const stats = [
  { value: '17+', label: 'Editable Slot Types' },
  { value: '70%', label: 'Revenue untuk Contributor' },
  { value: '1×', label: 'Pembelian Sekali' },
  { value: 'Gratis', label: 'Update Selamanya' },
]

const customizationTiles = [
  { icon: Palette, label: 'Colors', detail: 'Palette, gradient, shadow' },
  { icon: Type, label: 'Typography', detail: 'Font, scale, weight' },
  { icon: LayoutGrid, label: 'Layout', detail: 'Grid, spacing, radius' },
  { icon: Sparkles, label: 'Motion', detail: 'Animation, transition' },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <PageHeader
        eyebrow="About Korex"
        title={
          <>
            Membangun Tools yang <span className="text-gradient-fire">Memudahkan</span>
          </>
        }
        description="Korex adalah marketplace template premium dan platform editor visual. Kami membantu kreator dan bisnis untuk launch website yang sempurna tanpa mengorbankan desain."
      >
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/marketplace" className="korex-btn-primary px-8 py-3">
            Jelajahi Template
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link href="/contact" className="korex-btn-ghost px-8 py-3">
            Hubungi Kami
          </Link>
        </div>
      </PageHeader>

      <section className="bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600 py-16 text-white">
        <div className="korex-section">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="mb-2 font-display text-4xl font-semibold">
                  {stat.value}
                </div>
                <div className="text-orange-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="korex-section">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="korex-h2">Lahir dari Kebutuhan Sederhana</h2>
              <div className="mt-6 space-y-4 text-slate-600">
                <p>
                  Template website yang bagus dulu hanya ada dua pilihan: indah tapi
                  kaku, atau fleksibel tapi biasa-biasa saja. Kami percaya Anda tidak
                  harus memilih.
                </p>
                <p>
                  Korex dimulai dengan satu tujuan: membuat website yang dirancang
                  secara profesional sepenuhnya dapat dikustomisasi.
                </p>
                <p>
                  Hari ini, Korex menggabungkan marketplace yang dipilih dengan editor
                  visual yang powerful. Creator mempublikasikan karya terbaik mereka,
                  dan pelanggan menjadikannya milik mereka sendiri — semua dalam
                  hitungan menit, tanpa kode.
                </p>
                <p>
                  Kami adalah tim kecil yang obsesif terhadap desain, tersebar di
                  seluruh dunia, dipersatukan oleh cinta terhadap kualitas dan
                  keyakinan bahwa web layak untuk menjadi indah.
                </p>
              </div>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/marketplace" className="korex-btn-primary px-8 py-3">
                  Jelajahi Template
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link href="/contact" className="korex-btn-ghost px-8 py-3">
                  Hubungi Kami
                </Link>
              </div>
            </div>

            <div className="korex-card p-6 sm:p-8">
              <div className="grid grid-cols-2 gap-4">
                {customizationTiles.map(({ icon: Icon, label, detail }) => (
                  <div
                    key={label}
                    className="flex min-h-32 flex-col justify-between rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 to-white p-5"
                  >
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-orange-600 shadow-sm">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <div className="font-display text-base font-semibold text-slate-900">
                        {label}
                      </div>
                      <div className="mt-1 text-xs leading-relaxed text-slate-500">
                        {detail}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-5 text-center text-xs font-medium text-slate-500">
                Semua bagian visual dapat diubah dari editor.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="korex-section">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="korex-h2">Nilai-Nilai Kami</h2>
            <p className="mt-4 text-lg text-slate-600">
              Prinsip-prinsip yang memandu setiap keputusan yang kami buat
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-300 hover:shadow-lg"
              >
                <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-orange-50 text-orange-600">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="korex-h3 mb-2">{title}</h3>
                <p className="text-sm leading-relaxed text-slate-600">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="korex-section">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-600 via-orange-500 to-orange-600 px-8 py-16 text-center shadow-2xl">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
            </div>
            <div className="relative z-10 mx-auto max-w-3xl">
              <h2 className="font-display text-3xl font-semibold text-white sm:text-4xl">
                Bergabunglah dengan Komunitas Korex
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-orange-50">
                Apakah Anda ingin launch website atau menjual desain Anda, ada tempat
                untuk Anda di sini.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 font-semibold text-orange-600 shadow-lg transition-all hover:-translate-y-0.5 hover:bg-orange-50"
                >
                  Buat Akun
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/30 bg-white/10 px-8 py-4 font-semibold text-white backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white/20"
                >
                  Lihat Harga
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
