import { Clock, Mail, MapPin, MessageSquare } from 'lucide-react'
import { PageHeader } from '@/components/public/PageHeader'
import { ContactForm } from './ContactForm'
import { getCompanyContact } from '@/lib/company'

export const metadata = {
  title: 'Hubungi Kami',
  description: 'Beri tahu tim Korex untuk dukungan, penjualan atau kemitraan.',
}

async function ContactPage() {
  const contact = await getCompanyContact()

  const channels = [
    {
      icon: Mail,
      title: 'Email Kami',
      value: contact.email,
      description: 'Pertanyaan umum dan dukungan',
    },
    {
      icon: MessageSquare,
      title: 'Penjualan',
      value: 'sales@korex.studio',
      description: 'Paket agency dan enterprise',
    },
    {
      icon: MapPin,
      title: 'Studio',
      value: contact.address,
      description: 'Remote-first, worldwide',
    },
    {
      icon: Clock,
      title: 'Waktu Respons',
      value: 'Dalam 1 hari kerja',
      description: 'Senin sampai Jumat',
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      <PageHeader
        eyebrow="Contact"
        title={
          <>
            Mari <span className="text-gradient-fire">Membangun Sesuatu</span>
            <br />
            Hebat Bersama
          </>
        }
        description="Pertanyaan tentang template, paket, atau kemitraan? Tim kami siap membantu."
      />

      <section className="korex-section py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr]">
          <div className="space-y-4">
            {channels.map(({ icon: Icon, title, value, description }) => (
              <div
                key={title}
                className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-lg"
              >
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-orange-50 text-orange-600">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900">{title}</div>
                  <div className="text-base text-slate-900">{value}</div>
                  <div className="mt-0.5 text-sm text-slate-600">{description}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="korex-card p-8">
            <h2 className="font-display text-2xl font-semibold text-slate-900">
              Kirim Pesan
            </h2>
            <p className="mt-2 text-slate-600">
              Isi form dan kami akan menghubungi Anda sesegera mungkin.
            </p>
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      <section className="korex-section py-16">
        <div className="korex-card overflow-hidden">
          <div className="grid gap-8 p-8 sm:p-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <span className="korex-eyebrow">
                <MapPin className="h-3.5 w-3.5" />
                Studio
              </span>
              <h2 className="korex-h2 mt-5">Visit Our Studio</h2>
              <p className="mt-3 text-slate-600">{contact.address}</p>
              <p className="mt-1 text-sm text-slate-500">
                Remote-first, worldwide. Kunjungan dengan janji terlebih dahulu.
              </p>
            </div>

            <div className="relative min-h-64 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
              <div className="absolute inset-0 bg-grid opacity-60" />
              <div className="absolute inset-0 bg-radial-fire opacity-70" />
              <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
                <span className="grid h-14 w-14 place-items-center rounded-full bg-white text-orange-600 shadow-lg ring-1 ring-orange-100">
                  <MapPin className="h-6 w-6" />
                </span>
                <span className="mt-3 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
                  Jakarta, Indonesia
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ContactPage
